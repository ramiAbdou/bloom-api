import { nanoid } from 'nanoid';
import { Field, ID, ObjectType } from 'type-graphql';
import { PrimaryKey, Property } from '@mikro-orm/core';

import Cache from '@core/cache/cache';
import { now } from '@util/util';

/**
 * All entity classes will extend this. Includes the createdAt and updatedAt
 * timestamp fields.
 */
@ObjectType()
export default abstract class BaseEntity {
  static cache: Cache;

  // ## FIELDS

  @Field(() => ID)
  @PrimaryKey()
  id: string = nanoid();

  @Field()
  @Property()
  createdAt: string = now();

  @Field({ nullable: true })
  @Property({ nullable: true })
  deletedAt: string;

  @Field()
  @Property({ onUpdate: () => now() })
  updatedAt: string = now();

  // ## METHODS

  // eslint-disable-next-line class-methods-use-this
  async getCacheIdenitifers(): Promise<string[]> {
    return [];
  }
}
