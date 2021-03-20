/**
 * @group unit
 */

import Cache from './Cache';

const cache: Cache = new Cache();

describe('Cache', () => {
  beforeEach(() => cache.reset());

  test('cache.invalidate()', () => {
    cache.set('GET_COMMUNITY', { id: '1' });
    cache.set('GET_MEMBER', { id: '1' });
    cache.set('GET_USER', { id: '1' });
    cache.invalidate(['GET_COMMUNITY', 'GET_USER']);
    expect(cache.has('GET_COMMUNITY')).toBe(false);
    expect(cache.has('GET_MEMBER')).toBe(true);
    expect(cache.has('GET_USER')).toBe(false);
  });

  test('cache.set() - Key is not defined.', () => {
    const actualOutput = cache.set(null, { id: '1' });
    expect(cache.has(null)).toBe(false);
    expect(actualOutput).toBe(false);
  });

  test('cache.set() - Key is defined.', () => {
    const actualOutput = cache.set('GET_COMMUNITY', { id: '1' });
    expect(cache.has('GET_COMMUNITY')).toBe(true);
    expect(actualOutput).toBe(true);
  });
});
