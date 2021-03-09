import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import Member from '@entities/member/Member';
import { MailchimpEvent } from '@util/events';
import addToMailchimpAudience from './repo/addToMailchimpAudience';

export interface MailchimpEventArgs {
  communityId: string;
  memberId?: string;
  mailchimpEvent: MailchimpEvent;
}

/**
 * Processes the MailchimpEvent properly.
 *
 * @param args.communityId - ID of the Community.
 * @param args.memberId - ID of the Member.
 * @param args.mailchimpEvent - Internal Mailchimp event.
 */
const processMailchimpEvent = async (
  args: MailchimpEventArgs
): Promise<void> => {
  const { communityId, memberId, mailchimpEvent } = args;

  const bm = new BloomManager();

  const [integrations, member]: [Integrations, Member] = await Promise.all([
    bm.findOne(Integrations, { community: communityId }),
    bm.findOne(Member, memberId)
  ]);

  if (mailchimpEvent === MailchimpEvent.ADD_TO_AUDIENCE) {
    addToMailchimpAudience({
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      mailchimpAccessToken: integrations.mailchimpAccessToken,
      mailchimpListId: integrations.mailchimpListId
    });
  }
};

export default processMailchimpEvent;
