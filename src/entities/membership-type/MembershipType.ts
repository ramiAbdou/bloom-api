/**
 * @fileoverview Entity: MembershipType
 * @author Rami Abdou
 */

import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property
} from 'mikro-orm';
import { Field, Float, ObjectType } from 'type-graphql';

import { Community, Membership } from '@entities';
import BaseEntity from '@util/db/BaseEntity';

export type MembershipTypeRecurrence = 'MONTHLY' | 'YEARLY' | 'LIFETIME';

@ObjectType()
@Entity()
export default class MembershipType extends BaseEntity {
  @Field(() => Float)
  @Property({ type: Number })
  amount = 0.0;

  @Field(() => Boolean)
  @Property({ type: Boolean })
  isDefault = false;

  @Field()
  @Property()
  name: string;

  @Field(() => String)
  @Enum({ items: ['MONTHLY', 'YEARLY', 'LIFETIME'], type: String })
  recurrence: MembershipTypeRecurrence = 'LIFETIME';

  @Field()
  @Property({ persist: false })
  get isFree(): boolean {
    return this.amount > 0.0;
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne(() => Community)
  community: Community;

  @OneToMany(() => Membership, ({ type }) => type)
  memberships = new Collection<Membership>(this);
}
