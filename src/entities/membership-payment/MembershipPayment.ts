/**
 * @fileoverview Entity: MembershipPayment
 * @author Rami Abdou
 */

import { Entity, EntityRepositoryType, ManyToOne, Property } from 'mikro-orm';

import { Membership } from '@entities';
import BaseEntity from '@util/db/BaseEntity';
import MembershipPaymentRepo from './MembershipPaymentRepo';

@Entity({ customRepository: () => MembershipPaymentRepo })
export default class MembershipPayment extends BaseEntity {
  [EntityRepositoryType]?: MembershipPaymentRepo;

  @Property({ nullable: true })
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
