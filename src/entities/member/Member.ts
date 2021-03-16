import { IsUrl } from 'class-validator';
import day from 'dayjs';
import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  AfterUpdate,
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
  Unique,
  wrap
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import { QueryEvent } from '@util/constants.events';
import { now } from '@util/util';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventGuest from '../event-guest/EventGuest';
import EventInvitee from '../event-invitee/EventInvitee';
import EventWatch from '../event-watch/EventWatch';
import MemberIntegrations from '../member-integrations/MemberIntegrations';
import MemberPlan, { RecurrenceType } from '../member-plan/MemberPlan';
import MemberRefresh from '../member-refresh/MemberRefresh';
import MemberSocials from '../member-socials/MemberSocials';
import MemberValue from '../member-value/MemberValue';
import Payment, { PaymentType } from '../payment/Payment';
import User from '../user/User';

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
  static cache: Cache = new Cache();

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

  // ## METHODS

  /**
   * Returns true if the Member has paid their dues in less than the
   * RecurrenceType of their MemberPlan.
   *
   * Example: If the Member's current MemberPlan is on a MONTHLY recurrence
   * and they paid dues less than a month ago, then they are active. Otherwise,
   * they are not.
   */
  @Field(() => Boolean)
  async isDuesActive(): Promise<boolean> {
    await wrap(this.plan).init();

    const payments: Payment[] = await this.payments.loadItems();

    const lastDuesPayment: Payment = payments.find((payment: Payment) => {
      return payment.type === PaymentType.DUES;
    });

    if (!lastDuesPayment) return false;

    const { createdAt } = lastDuesPayment;
    const { recurrence } = this.plan;

    // If it's a LIFETIME payment, then they are active!
    if (recurrence === RecurrenceType.LIFETIME) return true;

    if (recurrence === RecurrenceType.MONTHLY) {
      const oneMonthAgo: day.Dayjs = day.utc().subtract(1, 'month');
      return day.utc(createdAt)?.isAfter(oneMonthAgo);
    }

    if (recurrence === RecurrenceType.YEARLY) {
      const oneYearAgo: day.Dayjs = day.utc().subtract(1, 'year');
      return day.utc(createdAt)?.isAfter(oneYearAgo);
    }

    return false;
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

  @AfterCreate()
  afterCreate() {
    Member.cache.invalidateKeys(
      this.status === MemberStatus.PENDING
        ? [`${QueryEvent.GET_APPLICANTS}-${this.community.id}`]
        : [`${QueryEvent.GET_MEMBERS}-${this.community.id}`]
    );
  }

  @AfterUpdate()
  afterUpdate() {
    Member.cache.invalidateKeys([
      `${QueryEvent.GET_MEMBERS}-${this.id}`,
      `${QueryEvent.GET_MEMBERS}-${this.community.id}`
    ]);
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

  @Field(() => MemberIntegrations)
  @OneToOne(() => MemberIntegrations, (integrations) => integrations.member)
  memberIntegrations: MemberIntegrations;

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
