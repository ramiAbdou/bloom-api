import { FindOneOptions, FindOptions } from '@mikro-orm/core';

import { LoggerEvent } from '@constants';

export interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  cacheKey?: string;
}

export interface BloomFindOneAndUpdateOptions<T, P>
  extends BloomFindOneOptions<T, P> {
  event: LoggerEvent;
}

export interface BloomFindOptions<T, P> extends FindOptions<T, P> {
  cacheKey?: string;
}

export interface BloomFindAndUpdateOptions<T, P>
  extends BloomFindOptions<T, P> {
  event: LoggerEvent;
}
