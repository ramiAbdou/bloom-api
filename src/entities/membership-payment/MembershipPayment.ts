/**
 * @fileoverview Entity: MembershipPayment
 * @author Rami Abdou
 */

import { Entity, ManyToOne, Property } from 'mikro-orm';

import { Membership } from '@entities';
import BaseEntity from '@util/db/BaseEntity';

@Entity()
export default class MembershipPayment extends BaseEntity {
  @Property()
  amount: number;

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne(() => Membership)
  membership: Membership;
}
