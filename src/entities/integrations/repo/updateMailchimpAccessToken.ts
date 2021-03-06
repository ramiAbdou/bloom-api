import BloomManager from '@core/db/BloomManager';
import getMailchimpAccessToken from '@integrations/mailchimp/repo/getMailchimpAccessToken';
import { AuthQueryArgs } from '@util/constants';
import { FlushEvent } from '@util/events';
import Integrations from '../Integrations';

/**
 * Returns the updated community after updating it's Mailchimp token. If
 * no community was found based on the urlName, returns null.
 *
 * Precondition: The community ID must represent a community.
 */
const updateMailchimpAccessToken = async ({
  code,
  state: urlName
}: AuthQueryArgs): Promise<Integrations> => {
  const mailchimpAccessToken = await getMailchimpAccessToken({ code });

  const integrations = await new BloomManager().findOneAndUpdate(
    Integrations,
    { community: { urlName } },
    { mailchimpAccessToken },
    { flushEvent: FlushEvent.UPDATE_MAILCHIMP_ACCESS_TOKEN }
  );

  return integrations;
};

export default updateMailchimpAccessToken;
