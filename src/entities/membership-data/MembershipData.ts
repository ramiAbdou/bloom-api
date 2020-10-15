/**
 * @fileoverview Entity: MembershipData
 * @author Rami Abdou
 */

import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToOne,
  Property
} from 'mikro-orm';

import BaseEntity from '@util/db/BaseEntity';
import MembershipQuestionOption from '../membership-question-option/MembershipQuestionOption';
import MembershipQuestion from '../membership-question/MembershipQuestion';
import Membership from '../membership/Membership';

@Entity()
export default class MembershipData extends BaseEntity {
  @Property({ nullable: true })
  value: string;

  /**
   * Because the question type can be a multitude of things, we must serialize
   * our value accordingly.
   */
  @Property({ persist: false })
  get serializedValue(): string | string[] {
    if (this.question.type === 'MULTIPLE_CHOICE') return this.option.value;
    if (this.question.type === 'DROPDOWN_MULTIPLE')
      return this.options.getItems().map(({ value }) => value);
    return this.value;
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne(() => Membership)
  membership: Membership;

  // Will only be populated in the case that the question is MULTIPLE_CHOICE.
  @OneToOne({ nullable: true })
  option: MembershipQuestionOption;

  // Will only be populated in the case that the question is DROPDOWN_MULTIPLE.
  // Uni-directional M:M.
  @ManyToMany(() => MembershipQuestionOption)
  options = new Collection<MembershipQuestionOption>(this);

  @OneToOne()
  question: MembershipQuestion;
}
