import { IntegrationsBrand } from '@constants';
import BloomManager from '@core/db/BloomManager';
import createStripeProducts from '@entities/member-type/repo/createStripeProducts';
import getStripeAccountId from '@integrations/stripe/repo/getStripeAccountId';
import { EmailEvent, FlushEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';
import { CommunityIntegrationsAuthArgs } from '../CommunityIntegrations.types';

/**
 * Stores the Stripe tokens in the database after executing the
 * OAuth token flow.
 *
 * @param code Stripe's API produced authorization code that we exchange for
 * tokens.
 */
const updateStripeAccountId = async ({
  code,
  urlName
}: CommunityIntegrationsAuthArgs): Promise<CommunityIntegrations> => {
  const stripeAccountId: string = await getStripeAccountId({ code });

  const integrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { urlName } },
    { stripeAccountId },
    {
      emailContext: { brand: IntegrationsBrand.STRIPE, urlName },
      emailEvent: EmailEvent.CONNECT_INTEGRATIONS,
      flushEvent: FlushEvent.STORE_STRIPE_ACCOUNT
    }
  );

  await createStripeProducts({ communityId: integrations.community.id });

  return integrations;
};

export default updateStripeAccountId;
