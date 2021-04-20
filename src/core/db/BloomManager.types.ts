import { FindOneOptions } from '@mikro-orm/core';

export interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  update?: boolean;
}

export interface BloomCreateAndFlushArgs<P> {
  populate?: P;
}

export type BloomFindOneAndUpdateOptions<T, P> = BloomFindOneOptions<T, P>;
