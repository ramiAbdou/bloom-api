/**
 * @fileoverview Entity: MembershipData
 * @author Rami Abdou
 */

import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToOne,
  Property
} from 'mikro-orm';

import BaseEntity from '@util/db/BaseEntity';
import BaseRepo from '@util/db/BaseRepo';
import MembershipQuestion from '../membership-question/MembershipQuestion';
import Membership from '../membership/Membership';

@Entity()
export default class MembershipData extends BaseEntity {
  [EntityRepositoryType]?: BaseRepo<MembershipData>;

  @Property({ nullable: true })
  value: string;

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne(() => Membership)
  membership: Membership;

  @OneToOne()
  question: MembershipQuestion;
}
