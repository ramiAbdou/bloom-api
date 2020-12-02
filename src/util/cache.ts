/**
 * @fileoverview Utility: Cache
 * @author Rami Abdou
 */

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
  invalidateEntries = (value: string | string[], byKey?: boolean) => {
    const isArray = Array.isArray(value);

    if (byKey) {
      this.invalidateEntriesByKey(value, isArray);
      return;
    }

    Object.entries(this.dependencies).forEach(
      ([key, dependencies]: [string, Set<string>]) => {
        if (
          (isArray &&
            (value as string[]).some((id: string) => dependencies.has(id))) ||
          (!isArray && dependencies.has(value as string))
        ) {
          this.del(key);
        }
      }
    );
  };

  /**
   * Invalidates all of the cache entries that have the given entity ID as a
   * dependency.
   */
  private invalidateEntriesByKey = (
    value: string | string[],
    isArray: boolean
  ) => {
    if (!isArray) this.del(value as string);
    else (value as string[]).forEach((key: string) => this.del(key));
  };

  /**
   * Stores a list of entity ID's that any given cache ID depends on. This
   * helps us in running cache invalidation when an entity is updated. Note
   * that we setTimeout for 0ms, which allows us to process this in
   * asynchronous manner. So, any DB operations will return to the client while
   * this runs in the background.
   */
  private processDependencies = (key: string, data: Record<string, any>) =>
    setTimeout(() => {
      const dependencies: Set<string> = new Set<string>();

      JSON.stringify(data, (k: string, v: any) => {
        if (k === 'id') dependencies.add(v);
        return v;
      });

      this.dependencies = merge({}, this.dependencies, { [key]: dependencies });
    }, 0);

  del = (key: string) => {
    super.del(key);
    delete this.dependencies[key];
  };

  set = (key: string, value: any) => {
    super.set(key, value);
    this.processDependencies(key, value);
    return true;
  };
}

export default new Cache();
