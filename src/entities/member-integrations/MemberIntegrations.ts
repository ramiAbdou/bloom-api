import { Authorized, Field, ObjectType } from 'type-graphql';
import { Entity, OneToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
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

  // ## RELATIONSHIPS

  @Field(() => Member)
  @OneToOne(() => Member, ({ integrations }) => integrations, { owner: true })
  member: Member;
}
