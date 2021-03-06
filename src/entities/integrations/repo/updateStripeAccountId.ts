import BloomManager from '@core/db/BloomManager';
import createStripeProducts from '@entities/member-plan/repo/createStripeProducts';
import getStripeAccountId from '@integrations/stripe/repo/getStripeAccountId';
import { emitEmailEvent } from '@system/eventBus';
import { AuthQueryArgs, IntegrationsBrand } from '@util/constants';
import { EmailEvent, MutationEvent } from '@util/events';
import Integrations from '../Integrations';

/**
 * Stores the Stripe tokens in the database after executing the
 * OAuth token flow.
 *
 * @param code Stripe's API produced authorization code that we exchange for
 * tokens.
 */
const updateStripeAccountId = async (
  args: AuthQueryArgs
): Promise<Integrations> => {
  const { code, state: urlName } = args;
  const stripeAccountId: string = await getStripeAccountId({ code });

  const integrations = await new BloomManager().findOneAndUpdate(
    Integrations,
    { community: { urlName } },
    { stripeAccountId },
    { flushEvent: MutationEvent.UPDATE_STRIPE_ACCOUNT_ID }
  );

  emitEmailEvent(EmailEvent.CONNECT_INTEGRATIONS, {
    brand: IntegrationsBrand.STRIPE,
    urlName
  });

  await createStripeProducts({ communityId: integrations.community.id });

  return integrations;
};

export default updateStripeAccountId;
