import { FindOneOptions } from '@mikro-orm/core';

export interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  update?: boolean;
}

export interface BloomCreateAndFlushArgs<P> {
  populate?: P;
}
