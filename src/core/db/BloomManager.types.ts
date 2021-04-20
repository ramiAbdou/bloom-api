import { FindOneOptions, FindOptions } from '@mikro-orm/core';

export interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  cacheKey?: string;
  update?: boolean;
}

export interface BloomCreateAndFlushArgs<P> {
  populate?: P;
}

export type BloomFindOneAndUpdateOptions<T, P> = BloomFindOneOptions<T, P>;
export interface BloomFindAndUpdateOptions<T, P> extends FindOptions<T, P> {
  cacheKey?: string;
}
