import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import createPayment from '@entities/payment/repo/createPayment';

/**
 * Handles a paid Stripe invoice by sending an email confirmation and if there
 * isn't a Payment stored yet,
 *
 * @param event - Stripe.Event to handle: 'invoice.paid'.
 */
const handleInvoicePaid = async (event: Stripe.Event): Promise<void> => {
  const stripeAccountId: string = event.account;
  const invoice = event.data.object as Stripe.Invoice;

  const bm: BloomManager = new BloomManager();

  const [community, member]: [Community, Member] = await Promise.all([
    bm.findOne(Community, { communityIntegrations: { stripeAccountId } }),
    bm.findOne(
      Member,
      { memberIntegrations: { stripeCustomerId: invoice.customer as string } },
      { populate: ['memberIntegrations'] }
    )
  ]);

  // If there was no amount paid on the Stripe.Invoice, then no need to create
  // a Payment in our own database, nor send a confirmation email.
  if (invoice.amount_paid) {
    await createPayment(
      { invoice, memberTypeId: member.memberType.id },
      { communityId: community.id, memberId: member.id }
    );
  }
};

export default handleInvoicePaid;
