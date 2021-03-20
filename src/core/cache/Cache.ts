import LRUCache from 'lru-cache';

import { APP } from '@util/constants';

export default class Cache extends LRUCache<string, any> {
  constructor() {
    super({ max: 1000, maxAge: APP.CACHE_TTL });
  }

  /**
   * Invalidates all of the keys in the cache.
   *
   * @param keys - Array of keys in the cache.
   */
  invalidate(keys: string[]): void {
    keys.forEach((key: string) => this.del(key));
  }

  /**
   * Returns true if successfully storing the key in the cache. Returns false,
   * otherwise. If the key is null or undefined, it doesn't store it in the
   * cache.
   *
   * @param key - Key to store in the cache.
   * @param value - Value to associate with the key.
   */
  set(key: string, value: any): boolean {
    if (key === null || key === undefined) return false;
    super.set(key, value);
    return true;
  }
}
