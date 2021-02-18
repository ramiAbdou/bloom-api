import { Field, ObjectType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Member from '../Member';

@ObjectType()
export class GetPaymentMethodResult {
  @Field()
  brand: string;

  @Field()
  expirationDate: string;

  @Field()
  last4: string;

  @Field()
  zipCode: string;
}

const getPaymentMethod = async (
  memberId: string
): Promise<GetPaymentMethodResult> => {
  const { community, stripePaymentMethodId } = await new BloomManager().findOne(
    Member,
    { id: memberId },
    { populate: ['community.integrations'] }
  );

  if (!stripePaymentMethodId) return null;

  const paymentMethod = await stripe.paymentMethods.retrieve(
    stripePaymentMethodId,
    community.integrations.stripeOptions
  );

  const { address } = paymentMethod.billing_details;
  const { brand, exp_month, exp_year, last4 } = paymentMethod.card;

  return {
    brand: `${brand[0].toUpperCase()}${brand.slice(1)}`,
    expirationDate: `${exp_month}/${exp_year}`,
    last4,
    zipCode: address.postal_code
  };
};

export default getPaymentMethod;
