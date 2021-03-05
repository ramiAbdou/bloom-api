import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Member from '@entities/member/Member';
import { MailchimpEvent } from '@util/events';
import addToMailchimpAudience from './repo/addToMailchimpAudience';

export interface MailchimpEventArgs {
  communityId: string;
  memberId?: string;
  mailchimpEvent: MailchimpEvent;
}

const processMailchimpEvent = async ({
  communityId,
  memberId,
  mailchimpEvent
}: MailchimpEventArgs): Promise<void> => {
  const bm = new BloomManager();

  const [integrations, member]: [
    CommunityIntegrations,
    Member
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: { id: communityId } }),
    bm.findOne(Member, { id: memberId })
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
