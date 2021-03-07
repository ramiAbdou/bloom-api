import { Authorized, Field, ObjectType } from 'type-graphql';
import { AfterUpdate, Entity, OneToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import Member from '../member/Member';
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
export default class MemberIntegrations extends BaseEntity {
  // ## FIELDS

  // We don't store any of the customer's financial data in our server. Stripe
  // handles all of that for us, we just need Stripe's customer ID in order
  // to use recurring payments.
  @Property({ nullable: true })
  stripeCustomerId: string;

  @Property({ nullable: true })
  stripePaymentMethodId: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  stripeSubscriptionId: string;

  // ## METHODS

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

  @AfterUpdate()
  afterUpdate() {
    cache.invalidateKeys([
      `${QueryEvent.GET_MEMBER_INTEGRATIONS}-${this.member.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Member)
  @OneToOne(() => Member, ({ memberIntegrations }) => memberIntegrations, {
    owner: true
  })
  member: Member;
}
