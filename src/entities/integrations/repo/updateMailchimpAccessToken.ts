import BloomManager from '@core/db/BloomManager';
import getMailchimpAccessToken from '@integrations/mailchimp/repo/getMailchimpAccessToken';
import { AuthQueryArgs } from '@util/constants';
import { MutationEvent } from '@util/events';
import Integrations from '../Integrations';

/**
 * Returns the updated Integrations.
 *
 * @param args.code - Code to exchange for token from Mailchimp API.
 */
const updateMailchimpAccessToken = async (
  args: AuthQueryArgs
): Promise<Integrations> => {
  const { code, state: urlName } = args;
  const mailchimpAccessToken = await getMailchimpAccessToken({ code });

  const integrations = await new BloomManager().findOneAndUpdate(
    Integrations,
    { community: { urlName } },
    { mailchimpAccessToken },
    { flushEvent: MutationEvent.UPDATE_MAILCHIMP_ACCESS_TOKEN }
  );

  return integrations;
};

export default updateMailchimpAccessToken;
