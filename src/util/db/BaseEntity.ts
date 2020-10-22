/**
 * @fileoverview Utility: BaseEntity
 * - All entity classes will extend this. Includes the createdAt and updatedAt
 * timestamp fields.
 * @author Rami Abdou
 */

import { PrimaryKey, Property } from 'mikro-orm';
import { nanoid } from 'nanoid';
import { Field, ID, ObjectType } from 'type-graphql';

import { now } from '@util/util';

@ObjectType()
export default abstract class BaseEntity {
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
}
