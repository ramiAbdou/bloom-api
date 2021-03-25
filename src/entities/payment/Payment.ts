import { IsUrl } from 'class-validator';
import { PaymentReceiptPayload } from 'src/system/emails/repo/getPaymentReceiptVars';
import Stripe from 'stripe';
import { Field, Float, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  Entity,
  ManyToOne,
  Property,
  wrap
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import Community from '@entities/community/Community';
import { stripe } from '@integrations/stripe/Stripe.util';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { EmailEvent, QueryEvent } from '@util/constants.events';
import MemberPlan from '../member-plan/MemberPlan';
import Member from '../member/Member';

export enum PaymentType {
  DONATION = 'DONATION',
  DUES = 'DUES'
}

@ObjectType()
@Entity()
export default class Payment extends BaseEntity {
  static cache: Cache = new Cache();

  // ## FIELDS

  @Field(() => Float)
  @Property({ columnType: 'decimal', serializer: (value) => Number(value) })
  amount: number;

  @Field(() => String)
  @Property()
  type: PaymentType;

  @Property({ unique: true })
  stripeInvoiceId: string;

  @Field()
  @Property({ unique: true })
  @IsUrl()
  stripeInvoiceUrl: string;

  // ## LIFECYCLE HOOKS

  @AfterCreate()
  async afterCreate() {
    Payment.cache.invalidate([
      // Need to make sure that the 'isDuesActive' is updated.
      `${QueryEvent.GET_MEMBERS}-${this.member.id}`,
      `${QueryEvent.GET_MEMBERS}-${this.community.id}`,
      `${QueryEvent.GET_PAYMENTS}-${this.community.id}`,
      `${QueryEvent.GET_PAYMENTS}-${this.member.id}`,
      `${QueryEvent.GET_PAYMENTS_SERIES}-${this.community.id}`
    ]);

    // Time to send an email confirmation for the Payment.
    await Promise.all([
      wrap(this.community).init(true, ['communityIntegrations']),
      wrap(this.member).init(true, ['memberIntegrations'])
    ]);

    const { stripeAccountId } = this.community.communityIntegrations;
    const { stripePaymentMethodId } = this.member.memberIntegrations;

    const method: Stripe.PaymentMethod = await stripe.paymentMethods.retrieve(
      stripePaymentMethodId,
      { stripeAccount: stripeAccountId }
    );

    // Blast off email!
    emitEmailEvent(EmailEvent.PAYMENT_RECEIPT, {
      card: method.card,
      paymentId: this.id,
      stripeAccountId
    } as PaymentReceiptPayload);
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => Member)
  @ManyToOne(() => Member)
  member: Member;

  @Field(() => MemberPlan)
  @ManyToOne(() => MemberPlan)
  plan: MemberPlan;
}
