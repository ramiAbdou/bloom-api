import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import { CommunityIntegrations } from '@entities/entities';
import addToMailchimpAudience from '@integrations/mailchimp/repo/addToMailchimpAudience';
import { QueryEvent } from '@util/events';
import { hasKeys } from '@util/util';
import Member from './Member';
import { MemberStatus } from './Member.types';

export default class MemberSubscriber implements EventSubscriber<Member> {
  getSubscribedEntities(): EntityName<Member>[] {
    return [Member];
  }

  /**
   * Adds a newly created member to the Mailchimp list, regardless if
   * member's status is PENDING, INVITED or ACCEPTED.
   */
  async afterCreate({ entity: member }: EventArgs<Member>) {
    const bm = new BloomManager();

    const integrations: CommunityIntegrations = await bm.findOne(
      CommunityIntegrations,
      { community: { id: member.community.id } }
    );

    await addToMailchimpAudience({
      email: member.user.email,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      mailchimpAccessToken: integrations.mailchimpAccessToken,
      mailchimpListId: integrations.mailchimpListId
    });
  }

  async afterUpdate({ changeSet, entity: member }: EventArgs<Member>) {
    cache.invalidateEntries([`${QueryEvent.GET_MEMBER}-${member.id}`]);

    const { originalEntity, payload } = changeSet;

    if (
      originalEntity?.status === MemberStatus.PENDING &&
      member?.status !== MemberStatus.PENDING
    ) {
      cache.invalidateEntries([
        `${QueryEvent.GET_APPLICANTS}-${member.community.id}`
      ]);
    }

    if (
      hasKeys(payload, ['deletedAt', 'role']) ||
      payload?.status === MemberStatus.ACCEPTED
    ) {
      cache.invalidateEntries([
        `${QueryEvent.GET_DATABASE}-${member.community.id}`,
        `${QueryEvent.GET_DIRECTORY}-${member.community.id}`
      ]);
    }
  }
}
