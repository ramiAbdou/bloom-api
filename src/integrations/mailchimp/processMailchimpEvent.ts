import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Member from '@entities/member/Member';
import { MailchimpEvent } from '@util/constants.events';
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

  const bm: BloomManager = new BloomManager();

  const [communityIntegrations, member]: [
    CommunityIntegrations,
    Member
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: communityId }),
    bm.findOne(Member, memberId)
  ]);

  if (mailchimpEvent === MailchimpEvent.ADD_TO_AUDIENCE) {
    addToMailchimpAudience({
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      mailchimpAccessToken: communityIntegrations.mailchimpAccessToken,
      mailchimpListId: communityIntegrations.mailchimpListId
    });
  }
};

export default processMailchimpEvent;
