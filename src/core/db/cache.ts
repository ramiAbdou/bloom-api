import LRUCache from 'lru-cache';

import { APP } from '@constants';

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
  invalidateEntries = (cacheKeys: string[]) => {
    if (cacheKeys?.length) {
      cacheKeys.forEach((key: string) => this.del(key));
    }
  };

  del = (key: string) => super.del(key);

  set = (key: string, value: any) => {
    if (key === undefined) return false;
    super.set(key, value);
    return true;
  };
}

export default new Cache();
