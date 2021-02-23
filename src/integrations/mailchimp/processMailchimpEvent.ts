import BloomManager from '@core/db/BloomManager';
import { CommunityIntegrations, User } from '@entities/entities';
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

  const [integrations, user]: [
    CommunityIntegrations,
    User
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: { id: communityId } }),
    bm.findOne(User, { members: { id: memberId } })
  ]);

  if (mailchimpEvent === MailchimpEvent.ADD_TO_AUDIENCE) {
    addToMailchimpAudience({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mailchimpAccessToken: integrations.mailchimpAccessToken,
      mailchimpListId: integrations.mailchimpListId
    });
  }
};

export default processMailchimpEvent;
