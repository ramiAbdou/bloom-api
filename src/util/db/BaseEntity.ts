/**
 * @fileoverview Utility: BaseEntity
 * - All entity classes will extend this. Includes the createdAt and updatedAt
 * timestamp fields.
 * @author Rami Abdou
 */

import { PrimaryKey, Property } from 'mikro-orm';
import shortid from 'shortid';
import { Field, ID, ObjectType } from 'type-graphql';

import { now } from '@util/util';

@ObjectType()
export default abstract class BaseEntity {
  @Field(() => ID)
  @PrimaryKey()
  id: string = shortid().toLowerCase();

  @Field(() => String)
  @Property()
  createdAt: string = now();

  @Field(() => String)
  @Property({ onUpdate: () => now() })
  updatedAt: string = now();
}
