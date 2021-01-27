import { FindOneOptions, FindOptions } from '@mikro-orm/core';

import { LoggerEvent } from '@constants';

export interface BloomManagerFlushArgs {
  cacheKeysToInvalidate?: string[];
  event?: LoggerEvent;
}
export interface BloomCreateAndFlushArgs<P> extends BloomManagerFlushArgs {
  populate?: P;
}

export interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  cacheKey?: string;
}

export interface BloomFindOneOrCreateAndFlushOptions<T, P>
  extends BloomFindOneOptions<T, P>,
    BloomManagerFlushArgs {}

export interface BloomFindOneAndUpdateOptions<T, P>
  extends BloomFindOneOptions<T, P>,
    BloomManagerFlushArgs {}

export interface BloomFindOptions<T, P> extends FindOptions<T, P> {
  cacheKey?: string;
}

export interface BloomFindAndUpdateOptions<T, P>
  extends BloomFindOptions<T, P>,
    BloomManagerFlushArgs {}

export interface BloomFindAndDeleteOptions<T, P>
  extends BloomFindOptions<T, P>,
    BloomManagerFlushArgs {
  hard?: boolean;
}
