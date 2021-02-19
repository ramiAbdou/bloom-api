import { FindOneOptions, FindOptions } from '@mikro-orm/core';

import { EmailEvent, FlushEvent } from '@util/events';
import { EmailContext } from '../emails/emails.types';

export interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  cacheKey?: string;
}

export interface BloomFindOptions<T, P> extends FindOptions<T, P> {
  cacheKey?: string;
}

export interface FlushArgs {
  emailContext?: EmailContext;
  emailEvent?: EmailEvent;
  flushEvent?: FlushEvent;
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
