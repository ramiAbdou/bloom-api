import merge from 'lodash.merge';
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
    cacheKeys.forEach((key: string) => this.del(key));
  };

  /**
   * Invalidates all of the cache entries that have the given entity ID as a
   * dependency.
   *
   * Precondition: value must be populated with some values.
   */
  invalidateEntriesByDependencies = (value: string[]) => {
    const invalidateFunc = () => {
      Object.entries(this.dependencies).forEach(
        ([key, dependencies]: [string, Set<string>]) => {
          if (value.some((id: string) => dependencies.has(id))) this.del(key);
        }
      );
    };

    setTimeout(invalidateFunc, 0);
  };

  del = (key: string) => {
    super.del(key);
    delete this.dependencies[key];
  };

  set = (key: string, value: any) => {
    if (key === undefined) return false;

    super.set(key, value);
    this.processDependencies(key, value);
    return true;
  };

  /**
   * Stores a list of entity ID's that any given cache ID depends on. This
   * helps us in running cache invalidation when an entity is updated. Note
   * that we setTimeout for 0ms, which allows us to process this in
   * asynchronous manner. So, any DB operations will return to the client while
   * this runs in the background.
   */
  private processDependencies = (key: string, data: Record<string, any>) => {
    const processFunc = () => {
      const dependencies: Set<string> = new Set<string>();

      JSON.stringify(data, (k: string, v: any) => {
        if (k === 'id') dependencies.add(v);
        return v;
      });

      this.dependencies = merge({}, this.dependencies, { [key]: dependencies });
    };

    setTimeout(processFunc, 0);
  };
}

export default new Cache();
