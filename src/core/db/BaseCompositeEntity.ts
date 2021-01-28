import { nanoid } from 'nanoid';
import { Field, ID, ObjectType } from 'type-graphql';
import { Property } from '@mikro-orm/core';

import { now } from '@util/util';

/**
 * All entity classes will extend this. Includes the createdAt and updatedAt
 * timestamp fields.
 */
@ObjectType()
export default abstract class BaseCompositeEntity {
  @Field(() => ID)
  @Property({ primary: true })
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
}
