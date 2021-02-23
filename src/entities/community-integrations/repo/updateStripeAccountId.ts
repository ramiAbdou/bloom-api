import { AuthQueryArgs, IntegrationsBrand } from '@constants';
import BloomManager from '@core/db/BloomManager';
import emitEmailEvent from '@core/events/emitEmailEvent';
import createStripeProducts from '@entities/member-type/repo/createStripeProducts';
import getStripeAccountId from '@integrations/stripe/repo/getStripeAccountId';
import { EmailEvent, FlushEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';

/**
 * Stores the Stripe tokens in the database after executing the
 * OAuth token flow.
 *
 * @param code Stripe's API produced authorization code that we exchange for
 * tokens.
 */
const updateStripeAccountId = async ({
  code,
  state: urlName
}: AuthQueryArgs): Promise<CommunityIntegrations> => {
  const stripeAccountId: string = await getStripeAccountId({ code });

  const integrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { urlName } },
    { stripeAccountId },
    { flushEvent: FlushEvent.UPDATE_STRIPE_ACCOUNT_ID }
  );

  emitEmailEvent(EmailEvent.CONNECT_INTEGRATIONS, {
    brand: IntegrationsBrand.STRIPE,
    urlName
  });

  await createStripeProducts({ communityId: integrations.community.id });

  return integrations;
};

export default updateStripeAccountId;