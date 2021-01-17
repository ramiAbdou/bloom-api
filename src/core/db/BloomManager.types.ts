import { AnyEntity, FindOneOptions, FindOptions } from '@mikro-orm/core';

import { LoggerEvent } from '@constants';

export interface BloomManagerFlushArgs {
  cacheKeysToInvalidate?: string[];
  event?: LoggerEvent;
}

export interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  cacheKey?: string;
}

export interface BloomFindOneAndUpdateOptions<T, P>
  extends BloomFindOneOptions<T, P>,
    BloomManagerFlushArgs {}

export interface BloomFindOptions<T, P> extends FindOptions<T, P> {
  cacheKey?: string;
}

export interface BloomFindAndUpdateOptions<T, P>
  extends BloomFindOptions<T, P> {
  event: LoggerEvent;
}

export interface BloomManagerDeleteAndFlushArgs extends BloomManagerFlushArgs {
  entities: AnyEntity<any>[];
}
