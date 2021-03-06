import LRUCache from 'lru-cache';

import { APP } from '@util/constants';
import { QueryEvent } from '@util/events';

class Cache extends LRUCache<string, any> {
  constructor() {
    super({ max: 1000, maxAge: APP.CACHE_TTL });
  }

  /**
   * Invalidates all of the cache entries that have the given entity ID as a
   * dependency.
   *
   * Precondition: value must be populated with some values.
   */
  invalidateKeys = (cacheKeys: string[]) => {
    if (cacheKeys?.length) {
      cacheKeys.forEach((key: string) => {
        this.del(key);
        this.invalidateRelatedKeys(key);
      });
    }
  };

  del = (key: string) => super.del(key);

  set = (key: string, value: any) => {
    if (key === undefined) return false;
    super.set(key, value);
    return true;
  };

  private invalidateRelatedKeys = (key: string): void => {
    const cacheKey = key?.substring(0, key?.indexOf('-')) as QueryEvent;
    if (!cacheKey) return;

    switch (cacheKey) {
      case QueryEvent.GET_EVENT:
        this.invalidateKeys([]);
        break;

      default:
        break;
    }
  };
}

export default new Cache();
