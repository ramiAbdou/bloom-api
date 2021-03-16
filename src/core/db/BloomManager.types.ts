import { FindOneOptions, FindOptions } from '@mikro-orm/core';

import { FlushEvent } from '@util/constants.events';

export interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  cacheKey?: string;
  update?: boolean;
}

export interface BloomFindOptions<T, P> extends FindOptions<T, P> {
  cacheKey?: string;
}

export interface FlushArgs {
  flushEvent?: FlushEvent;
  invalidateKeys?: string[];
}

export interface BloomCreateAndFlushArgs<P> extends FlushArgs {
  populate?: P;
}

export interface BloomFindOneAndUpdateOptions<T, P>
  extends BloomFindOneOptions<T, P>,
    FlushArgs {}

export interface BloomFindAndUpdateOptions<T, P>
  extends BloomFindOptions<T, P>,
    FlushArgs {}

export interface BloomFindAndDeleteOptions<T, P>
  extends BloomFindOptions<T, P>,
    FlushArgs {
  soft?: boolean;
}
