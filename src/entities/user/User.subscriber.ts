import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import { decodeToken, hasKeys } from '@util/util';
import User from './User';

export default class UserSubscriber implements EventSubscriber<User> {
  getSubscribedEntities(): EntityName<User>[] {
    return [User];
  }

  async afterUpdate({ changeSet, entity }: EventArgs<User>) {
    const { payload } = changeSet;
    cache.invalidateKeys([`${QueryEvent.GET_USER}-${entity.id}`]);

    const communityId = decodeToken(entity.refreshToken)?.communityId;

    if (hasKeys(payload, ['firstName', 'lastName', 'pictureUrl'])) {
      cache.invalidateKeys([`${QueryEvent.GET_DIRECTORY}-${communityId}`]);
    }
  }
}
