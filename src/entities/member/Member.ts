import { IsUrl } from 'class-validator';
import { Authorized, Field, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  BeforeUpdate,
  Cascade,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  QueryOrder,
  Unique
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { now } from '@util/util';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventGuest from '../event-guest/EventGuest';
import EventInvitee from '../event-invitee/EventInvitee';
import EventWatch from '../event-watch/EventWatch';
import MemberPlan from '../member-plan/MemberPlan';
import MemberRefresh from '../member-refresh/MemberRefresh';
import MemberSocials from '../member-socials/MemberSocials';
import MemberValue from '../member-value/MemberValue';
import Payment from '../payment/Payment';
import User from '../user/User';
import getNextPaymentDate from './repo/getNextPaymentDate';
import getPaymentMethod, {
  GetPaymentMethodResult
} from './repo/getPaymentMethod';
import isDuesActive from './repo/isDuesActive';

export enum MemberRole {
  ADMIN = 'Admin',
  OWNER = 'Owner'
}

export enum MemberStatus {
  ACCEPTED = 'Accepted',
  INVITED = 'Invited',
  PENDING = 'Pending',
  REJECTED = 'Rejected'
}

@ObjectType()
@Entity()
@Unique({ properties: ['community', 'email'] })
export default class Member extends BaseEntity {
  // ## FIELDS

  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  bio: string;

  @Field()
  @Property()
  email: string;

  @Field()
  @Property()
  firstName: string;

  @Field()
  @Property({ persist: false })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Field()
  @Property()
  lastName: string;

  // Refers to the date that the member was ACCEPTED.
  @Field({ nullable: true })
  @Property({ nullable: true })
  joinedAt?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  pictureUrl: string;

  // If the member has a role, it will either be ADMIN or OWNER. There should
  // only be one OWNER in a community.
  @Field(() => String, { nullable: true })
  @Enum({ items: () => MemberRole, nullable: true, type: String })
  role: MemberRole;

  @Field(() => String)
  @Enum({ items: () => MemberStatus, type: String })
  status: MemberStatus = MemberStatus.PENDING;

  // We don't store any of the customer's financial data in our server. Stripe
  // handles all of that for us, we just need Stripe's customer ID in order
  // to use recurring payments.
  @Field({ nullable: true })
  @Property({ nullable: true })
  stripeCustomerId: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  stripePaymentMethodId: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  stripeSubscriptionId: string;

  // ## METHODS

  @Field(() => Boolean)
  async isDuesActive(): Promise<boolean> {
    return isDuesActive({ memberId: this.id });
  }

  @Authorized()
  @Field(() => GetPaymentMethodResult, { nullable: true })
  async paymentMethod() {
    return getPaymentMethod(this.id);
  }

  @Authorized()
  @Field(() => String, { nullable: true })
  async nextPaymentDate() {
    return getNextPaymentDate(this.id);
  }

  // ## LIFECYCLE HOOKS

  @BeforeCreate()
  beforeCreate() {
    if (
      (this.role && this.status !== MemberStatus.INVITED) ||
      this.community.autoAccept
    ) {
      this.joinedAt = now();
      this.status = MemberStatus.ACCEPTED;
    }

    // If no member type is provided, assign them the default member.
    // Every community should've assigned one default member.
    if (!this.plan) this.plan = this.community.defaultType;

    this.firstName = this.firstName.trim();
    this.lastName = this.lastName.trim();
  }

  @BeforeUpdate()
  beforeUpdate() {
    if (this.status === MemberStatus.ACCEPTED && !this.joinedAt) {
      this.joinedAt = now();
    }
  }

  // ## RELATIONSHIPS

  @Field(() => [EventAttendee])
  @OneToMany(() => EventAttendee, ({ member }) => member)
  attendees = new Collection<EventAttendee>(this);

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => [EventGuest])
  @OneToMany(() => EventGuest, ({ member }) => member)
  guests = new Collection<EventGuest>(this);

  @Field(() => [EventInvitee])
  @OneToMany(() => EventInvitee, ({ member }) => member)
  invitees = new Collection<EventInvitee>(this);

  @Field(() => [Payment])
  @OneToMany(() => Payment, ({ member }) => member, {
    orderBy: { createdAt: QueryOrder.DESC }
  })
  payments: Collection<Payment> = new Collection<Payment>(this);

  // 99% of the time, type MUST exist. However, in some communities, the OWNER
  // or ADMINs are not actually general members of the community. For example,
  // in ColorStack, the Community Manager isn't a part of the community, but
  // in MALIK, even the National President is a general dues-paying member.
  @Field(() => MemberPlan)
  @ManyToOne(() => MemberPlan, { nullable: true })
  plan: MemberPlan;

  @OneToMany(() => MemberRefresh, ({ member }) => member)
  refreshes: Collection<MemberRefresh> = new Collection<MemberRefresh>(this);

  @Field(() => MemberSocials)
  @OneToOne(() => MemberSocials, ({ member }) => member)
  socials: MemberSocials;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;

  // Data will only be populated if a question has ever been answered before.
  @Field(() => [MemberValue])
  @OneToMany(() => MemberValue, ({ member }) => member, {
    cascade: [Cascade.ALL]
  })
  values = new Collection<MemberValue>(this);

  @Field(() => [EventWatch])
  @OneToMany(() => EventWatch, ({ member }) => member)
  watches = new Collection<EventWatch>(this);
}
