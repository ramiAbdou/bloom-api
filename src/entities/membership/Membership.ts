/**
 * @fileoverview Entity: Membership
 * @author Rami Abdou
 */

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
// import dataQueue from '@util/cache/dataQueue';
import BaseEntity from '@util/db/BaseEntity';
import { now } from '@util/util';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventRSVP from '../event-rsvp/EventRSVP';
import MembershipCardItem from '../membership-card-item/MembershipCardItem';
import MembershipData from '../membership-data/MembershipData';
import MembershipPayment from '../membership-payment/MembershipPayment';
import MembershipQuestion from '../membership-question/MembershipQuestion';
import MembershipType from '../membership-type/MembershipType';
import User from '../user/User';
import { MemberData, MembershipRole } from './Membership.args';
import MembershipRepo from './Membership.repo';

export type MembershipStatus = 'REJECTED' | 'PENDING' | 'ACCEPTED';

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

  @Field()
  @Property()
  joinedOn: string = now();

  // If the member has a role, it will either be ADMIN or OWNER. There should
  // only be one OWNER in a community.
  @Field(() => String, { nullable: true })
  @Enum({ items: ['ADMIN', 'OWNER'], nullable: true, type: String })
  role: MembershipRole;

  @Field(() => String)
  @Enum({ items: ['REJECTED', 'PENDING', 'ACCEPTED'], type: String })
  status: MembershipStatus = 'PENDING';

  // We don't store any of the customer's financial data in our server. Stripe
  // handles all of that for us, we just need Stripe's customer ID in order
  // to use recurring payments.
  @Field({ nullable: true })
  @Property({ nullable: true })
  stripeCustomerId: string;

  /**
   * Returns the Membership data that is needed to be displayed in the
   * Community Directory.
   */
  cardData() {
    const membershipData = this.data.getItems();
    const {
      currentLocation,
      facebookUrl,
      instagramUrl,
      linkedInUrl,
      twitterUrl
    } = this.user;

    // The community specified a list of questions or user-specific categories
    // to be in the card, so we map each of the items to the appropriate value.
    return this.community.membershipCard
      .getItems()
      .map(({ category, inMinimizedCard, question }: MembershipCardItem) => {
        let value: string;

        // If no user category is specified, it means it is the item is from
        // the membership data, NOT the user data.
        if (!category)
          value = membershipData.find(
            ({ question: { id: questionId } }) => question.id === questionId
          ).value;
        else if (category === 'BIO') value = this.bio;
        else if (category === 'CURRENT_LOCATION') value = currentLocation;
        else if (category === 'FACEBOOK_URL') value = facebookUrl;
        else if (category === 'INSTAGRAM_URL') value = instagramUrl;
        else if (category === 'LINKEDIN_URL') value = linkedInUrl;
        else if (category === 'TWITTER_URL') value = twitterUrl;

        return { category, inMinimizedCard, value };
      });
  }

  @Authorized('ADMIN')
  @Field(() => [MemberData])
  allData(): MemberData[] {
    const data = this.data?.getItems();
    const { email, gender, firstName, lastName } = this.user;

    // @ts-ignore b/c this will only be queried in certain cases.
    return this.community.questions
      .getItems()
      .map(({ category, id, title }: MembershipQuestion) => {
        let value: string;
        const result = data.find(({ question }) => question.title === title);

        if (result) value = result.value;
        else if (category === 'DATE_JOINED') value = this.joinedOn;
        else if (category === 'EMAIL') value = email;
        else if (category === 'FIRST_NAME') value = firstName;
        else if (category === 'GENDER') value = gender;
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
          else if (category === 'DATE_JOINED') value = this.joinedOn;
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
    if (this.role || this.community.autoAccept) this.status = 'ACCEPTED';
    if (!this.type)
      // eslint-disable-next-line prefer-destructuring
      this.type = this.community.types
        .getItems()
        .filter(({ isDefault }) => isDefault)[0];
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

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
