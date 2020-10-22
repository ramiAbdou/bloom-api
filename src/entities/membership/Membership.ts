/**
 * @fileoverview Entity: Membership
 * @author Rami Abdou
 */

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
} from 'mikro-orm';
import moment from 'moment';
import { Authorized, Field, ObjectType } from 'type-graphql';

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
import { MembershipRole } from './MembershipArgs';
import MembershipRepo from './MembershipRepo';

export type MembershipStatus = 'REJECTED' | 'PENDING' | 'APPROVED';

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
  @Enum({ items: ['REJECTED', 'PENDING', 'APPROVED'], type: String })
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
  @Property({ persist: false })
  get cardData() {
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
  @Field(() => [MembershipData])
  @Property({ persist: false })
  get fullData(): MembershipData[] {
    const data = this.data.getItems();
    const { email, gender, firstName, lastName } = this.user;

    // @ts-ignore b/c this will only be queried in certain cases.
    return this.community.questions
      .getItems()
      .map(({ category, id, order, title, type }: MembershipQuestion) => {
        let value: string;
        const result = data.find(({ question }) => question.title === title);

        if (result) value = result.value;
        else if (category === 'DATE_JOINED') value = this.joinedOn;
        else if (category === 'EMAIL') value = email;
        else if (category === 'FIRST_NAME') value = firstName;
        else if (category === 'GENDER') value = gender;
        else if (category === 'LAST_NAME') value = lastName;
        else if (category === 'MEMBERSHIP_TYPE') value = this.type.name;

        return { question: { id, order, title, type }, value };
      });
  }

  /**
   * Returns true if the member has paid their dues. If the membership type
   * is free, automatically returns true.
   */
  @Property({ persist: false })
  get isActive(): boolean {
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
    if (this.community.autoAccept) this.status = 'APPROVED';
    if (!this.type) this.type = this.community.defaultMembership;
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

  @ManyToOne(() => MembershipType)
  type: MembershipType;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;
}
