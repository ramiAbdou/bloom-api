/**
 * @fileoverview Entity: MembershipType
 * - Each community can have a multitude of membership types. For example:
 * "Youth Member", "Leadership", etc.
 * @author Rami Abdou
 */

import { Entity, ManyToOne, Property } from 'mikro-orm';
import { Field, InputType, ObjectType } from 'type-graphql';

import BaseEntity from '@util/db/BaseEntity';
import Community from '../community/Community';

@InputType()
@ObjectType()
@Entity()
export default class MembershipType extends BaseEntity {
  // If the membership type is one that has admin priveleges, then mark as
  // true.
  @Field(() => Boolean)
  @Property({ type: Boolean })
  isAdmin = false;

  /**
   * @example "Youth Member"
   * @example "General Member"
   * @example "Leader"
   * @example "Alumni"
   * @example "Admin"
   */
  @Field(() => String)
  @Property()
  name: string;

  @ManyToOne(() => Community)
  community: Community;
}
