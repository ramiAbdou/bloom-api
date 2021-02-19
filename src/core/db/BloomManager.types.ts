import { FindOneOptions, FindOptions } from '@mikro-orm/core';

import { FlushEvent } from '@util/events';

export interface BloomCreateAndFlushArgs<P> {
  flushEvent?: FlushEvent;
  populate?: P;
}

export interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  cacheKey?: string;
}

export interface BloomFindOneAndUpdateOptions<T, P>
  extends BloomFindOneOptions<T, P> {
  flushEvent?: FlushEvent;
}

export interface BloomFindOptions<T, P> extends FindOptions<T, P> {
  cacheKey?: string;
}

export interface BloomFindAndUpdateOptions<T, P>
  extends BloomFindOptions<T, P> {
  flushEvent?: FlushEvent;
}

export interface BloomFindAndDeleteOptions<T, P>
  extends BloomFindOptions<T, P> {
  flushEvent?: FlushEvent;
  soft?: boolean;
}
