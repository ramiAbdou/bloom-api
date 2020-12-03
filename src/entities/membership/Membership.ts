import moment from 'moment';
import { Authorized, Field, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  ManyToOne,
  OneToMany,
  Property,
  QueryOrder
} from '@mikro-orm/core';

import BaseEntity from '@util/db/BaseEntity';
import { now } from '@util/util';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventRSVP from '../event-rsvp/EventRSVP';
import MembershipData from '../membership-data/MembershipData';
import MembershipPayment from '../membership-payment/MembershipPayment';
import MembershipQuestion from '../membership-question/MembershipQuestion';
import MembershipType from '../membership-type/MembershipType';
import User from '../user/User';
import {
  MemberData,
  MembershipRole,
  MembershipStatus
} from './Membership.args';
import MembershipRepo from './Membership.repo';

@ObjectType()
@Entity({ customRepository: () => MembershipRepo })
export default class Membership extends BaseEntity {
  [EntityRepositoryType]?: MembershipRepo;

  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  bio: string;

  // Member is allowed to opt-out of email notifications that send after an
  // event gets posted.
  @Field(() => Boolean)
  @Property({ type: Boolean })
  emailNotifications = true;

  // Refers to the date that the membership was ACCEPTED.
  @Field({ nullable: true })
  @Property({ nullable: true })
  joinedOn: string;

  // If the member has a role, it will either be ADMIN or OWNER. There should
  // only be one OWNER in a community.
  @Field(() => String, { nullable: true })
  @Enum({ items: ['ADMIN', 'OWNER'], nullable: true, type: String })
  role: MembershipRole;

  @Field(() => String)
  @Enum({ items: ['REJECTED', 'PENDING', 'INVITED', 'ACCEPTED'], type: String })
  status: MembershipStatus = 'PENDING';

  // We don't store any of the customer's financial data in our server. Stripe
  // handles all of that for us, we just need Stripe's customer ID in order
  // to use recurring payments.
  @Field({ nullable: true })
  @Property({ nullable: true })
  stripeCustomerId: string;

  // ## MEMBER FUNCTIONS

  @Authorized('ADMIN')
  @Field(() => [MemberData])
  allData(): MemberData[] {
    const data = this.data?.getItems();
    const { email, gender, firstName, lastName } = this.user;

    return this.community.questions
      .getItems()
      .map(({ category, id, title }: MembershipQuestion) => {
        let value: string;
        const result = data.find(({ question }) => question.title === title);

        if (result) value = result.value;
        else if (category === 'EMAIL') value = email;
        else if (category === 'FIRST_NAME') value = firstName;
        else if (category === 'GENDER') value = gender;
        else if (category === 'JOINED_ON') value = this.joinedOn;
        else if (category === 'LAST_NAME') value = lastName;
        else if (category === 'MEMBERSHIP_TYPE') value = this.type.name;

        return { questionId: id, value };
      });
  }

  /**
   * Returns the pending application data that will allow the ADMIN of the
   * community to accept or reject the application.
   */
  @Authorized('ADMIN')
  @Field(() => [MemberData])
  applicantData(): MemberData[] {
    // This method is only intended for retrieving pending application data.
    if (this.status !== 'PENDING') return null;

    const data = this.data.getItems();
    const { email, gender, firstName, lastName } = this.user;

    return (
      this.community.questions
        .getItems()
        // We only need the questions in the application.
        .filter(({ inApplication }: MembershipQuestion) => inApplication)
        .map(({ category, id, title }: MembershipQuestion) => {
          let value: string;
          const result = data.find(({ question }) => question.title === title);

          if (result) value = result.value;
          else if (category === 'JOINED_ON') value = this.joinedOn;
          else if (category === 'EMAIL') value = email;
          else if (category === 'FIRST_NAME') value = firstName;
          else if (category === 'GENDER') value = gender;
          else if (category === 'LAST_NAME') value = lastName;
          else if (category === 'MEMBERSHIP_TYPE') value = this.type.name;

          return { questionId: id, value };
        })
    );
  }

  /**
   * Returns true if the member has paid their dues. If the membership type
   * is free, automatically returns true.
   */
  isActive(): boolean {
    const { isFree, recurrence } = this.type;
    if (isFree) return true;

    // If the membership is not free and there's no payments recorded, means
    // that they haven't paid.
    const lastPaidDate = this.payments[0]?.createdAt;
    if (!lastPaidDate) return false;

    // If the membership is a LIFETIME membership and the member has paid
    // any dues at all, regardless of the date, then they are active.
    if (recurrence === 'LIFETIME') return true;

    // If the recurrence is MONTHLY, then we grab the date from a month ago.
    // If the recurrence is YEARLY, then we grab the date from a year ago.
    const checkAgainstMoment = moment
      .utc()
      .subtract(1, recurrence === 'MONTHLY' ? 'month' : 'year');

    // The member is active if they've paid after the date above.
    return checkAgainstMoment.isBefore(moment.utc(lastPaidDate));
  }

  @BeforeCreate()
  beforeCreate() {
    if (this.role || this.community.autoAccept) {
      this.joinedOn = now();
      this.status = 'ACCEPTED';
    }

    // If no membership type is provided, assign them the default membership.
    // Every community should've assigned one default membership.
    if (!this.type)
      // eslint-disable-next-line prefer-destructuring
      this.type = this.community.types
        .getItems()
        .find(({ isDefault }) => isDefault);
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  // Data will only be populated if a question has ever been answered before.
  @Field(() => [MembershipData])
  @OneToMany(() => MembershipData, ({ membership }) => membership)
  data = new Collection<MembershipData>(this);

  @OneToMany(() => EventAttendee, ({ membership }) => membership)
  eventsAttended = new Collection<EventAttendee>(this);

  @OneToMany(() => EventRSVP, ({ membership }) => membership)
  eventsRSVPd = new Collection<EventRSVP>(this);

  @OneToMany(() => MembershipPayment, ({ membership }) => membership, {
    orderBy: { createdAt: QueryOrder.DESC }
  })
  payments = new Collection<MembershipPayment>(this);

  // 99% of the time, type MUST exist. However, in some communities, the OWNER
  // or ADMINs are not actually general members of the community. For example,
  // in ColorStack, the Community Manager isn't a part of the community, but
  // in MALIK, even the National President is a general dues-paying member.
  @Field(() => MembershipType)
  @ManyToOne(() => MembershipType, { nullable: true })
  type: MembershipType;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;
}
