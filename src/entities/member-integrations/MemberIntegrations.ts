import { Authorized, Field, ObjectType } from 'type-graphql';
import { AfterUpdate, Entity, OneToOne, Property } from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import { QueryEvent } from '@util/events';
import Member from '../member/Member';
import getNextPaymentDate from './repo/getNextPaymentDate';
import getPaymentMethod, {
  GetPaymentMethodResult
} from './repo/getPaymentMethod';

@ObjectType()
@Entity()
export default class MemberIntegrations extends BaseEntity {
  static cache: Cache = new Cache();

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
    MemberIntegrations.cache.invalidateKeys([
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
