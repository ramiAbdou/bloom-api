/**
 * @fileoverview Entity: MembershipQuestionOption
 * @author Rami Abdou
 */

import { Entity, ManyToOne, Property } from 'mikro-orm';

import BaseEntity from '@util/db/BaseEntity';
import MembershipQuestion from '../membership-question/MembershipQuestion';

@Entity()
export default class MembershipQuestionOption extends BaseEntity {
  @Property()
  value: string;

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne()
  question: MembershipQuestion;
}
