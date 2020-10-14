/**
 * @fileoverview Entity: MembershipData
 * @author Rami Abdou
 */

import { Entity, ManyToOne, OneToOne, Property } from 'mikro-orm';

import { Membership } from '@entities';
import BaseEntity from '@util/db/BaseEntity';
import MembershipQuestion from '../membership-question/MembershipQuestion';

@Entity()
export default class MembershipData extends BaseEntity {
  @Property({ nullable: true })
  value: string;

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne()
  membership: Membership;

  @OneToOne()
  question: MembershipQuestion;
}
