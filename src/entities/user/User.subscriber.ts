import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import { decodeToken } from '@util/util';
import User from './User';

@Subscriber()
export default class UserSubscriber implements EventSubscriber<User> {
  async afterUpdate({ changeSet, entity }: EventArgs<User>) {
    const payload = changeSet;
    cache.invalidateEntries([`${QueryEvent.GET_USER}-${entity.id}`]);

    const communityId = decodeToken(entity.refreshToken)?.communityId;

    if (
      'firstName' in payload ||
      'lastName' in payload ||
      'pictureUrl' in payload
    ) {
      cache.invalidateEntries([`${QueryEvent.GET_DIRECTORY}-${communityId}`]);
    }
  }
}
