import day from 'dayjs';
import Stripe from 'stripe';
import { Authorized, Field, ObjectType } from 'type-graphql';
import { AfterUpdate, Entity, OneToOne, Property, wrap } from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import { stripe } from '@integrations/stripe/Stripe.util';
import { QueryEvent } from '@util/events';
import Member from '../member/Member';

@ObjectType()
export class PaymentMethod {
  @Field()
  brand: string;

  @Field()
  expirationDate: string;

  @Field()
  last4: string;

  @Field()
  zipCode: string;
}

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

  /**
   * Returns a formatted version of the Stripe.PaymentMethod.
   *
   * @example paymentMethod() => {
   *  brand: "Visa",
   *  expirationDate: "08/24",
   *  last4: "3221",
   *  zipCode: "91789",
   * }
   */
  @Authorized()
  @Field(() => PaymentMethod, { nullable: true })
  async paymentMethod(): Promise<PaymentMethod> {
    if (!this.stripePaymentMethodId) return null;

    // Need to grab the stripeAccountId.
    await wrap(this.member).init(true, ['community.communityIntegrations']);

    const paymentMethod = await stripe.paymentMethods.retrieve(
      this.stripePaymentMethodId,
      {
        stripeAccount: this.member.community.communityIntegrations
          .stripeAccountId
      }
    );

    const { address } = paymentMethod.billing_details;
    const { brand, exp_month, exp_year, last4 } = paymentMethod.card;

    return {
      brand: `${brand[0].toUpperCase()}${brand.slice(1)}`,
      expirationDate: `${exp_month}/${exp_year}`,
      last4,
      zipCode: address.postal_code
    };
  }

  /**
   * Returns the renewalDate of the Stripe.Subscription, if the
   * stripeSubscriptionId exists. Returns null, otherwise.
   *
   * @example renewalDate() => "2021-04-09T07:19:20-08:00"
   */
  @Authorized()
  @Field(() => String, { nullable: true })
  async renewalDate(): Promise<string> {
    if (!this.stripeSubscriptionId) return null;

    // Need to grab the stripeAccountId.
    await wrap(this.member).init(true, ['community.communityIntegrations']);

    const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
      this.stripeSubscriptionId,
      {
        stripeAccount: this.member.community.communityIntegrations
          .stripeAccountId
      }
    );

    return day.utc(subscription.current_period_end * 1000).format();
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
