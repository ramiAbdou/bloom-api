import LRUCache from 'lru-cache';

import { APP } from '@constants';

class Cache extends LRUCache<string, any> {
  // Maps a cache ID to the list of entity ID's that are stored in the data.
  private dependencies: Record<string, Set<string>> = {};

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
    if (!cacheKeys?.length) return;
    cacheKeys.forEach((key: string) => this.del(key));
  };

  del = (key: string) => {
    super.del(key);
    delete this.dependencies[key];
  };

  set = (key: string, value: any) => {
    if (key === undefined) return false;
    super.set(key, value);
    return true;
  };
}

export default new Cache();
