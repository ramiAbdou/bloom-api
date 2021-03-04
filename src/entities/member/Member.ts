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
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { now } from '@util/util';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventGuest from '../event-guest/EventGuest';
import EventInvitee from '../event-invitee/EventInvitee';
import EventWatch from '../event-watch/EventWatch';
import MemberPayment from '../member-payment/MemberPayment';
import MemberRefresh from '../member-refresh/MemberRefresh';
import MemberType from '../member-type/MemberType';
import MemberValue from '../member-value/MemberValue';
import User from '../user/User';
import getNextPaymentDate from './repo/getNextPaymentDate';
import getPaymentMethod, {
  GetPaymentMethodResult
} from './repo/getPaymentMethod';

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
export default class Member extends BaseEntity {
  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  bio: string;

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

  @Field({ defaultValue: false })
  @Property()
  isDuesActive: boolean = false;

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

  // ## STRIPE INFORMATION

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

  // ## STRIPE RELATED MEMBER FUNCTIONS

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

  // ## LIFECYCLE

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
    if (!this.type) this.type = this.community.defaultType;
    if (this.type.isFree) this.isDuesActive = true;

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

  @Field(() => [MemberPayment])
  @OneToMany(() => MemberPayment, ({ member }) => member)
  payments: Collection<MemberPayment> = new Collection<MemberPayment>(this);

  @OneToMany(() => MemberRefresh, ({ member }) => member)
  refreshes: Collection<MemberRefresh> = new Collection<MemberRefresh>(this);

  // 99% of the time, type MUST exist. However, in some communities, the OWNER
  // or ADMINs are not actually general members of the community. For example,
  // in ColorStack, the Community Manager isn't a part of the community, but
  // in MALIK, even the National President is a general dues-paying member.
  @Field(() => MemberType)
  @ManyToOne(() => MemberType, { nullable: true })
  type: MemberType;

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
