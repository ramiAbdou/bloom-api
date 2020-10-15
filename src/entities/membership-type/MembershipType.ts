/**
 * @fileoverview Entity: MembershipType
 * @author Rami Abdou
 */

import { Collection, Entity, ManyToOne, OneToMany, Property } from 'mikro-orm';

import { Community, Membership } from '@entities';
import BaseEntity from '@util/db/BaseEntity';

@Entity()
export default class MembershipType extends BaseEntity {
  @Property()
  amount: number;

  @Property({ type: Boolean })
  expiresIn: number;

  @Property()
  name: string;

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
