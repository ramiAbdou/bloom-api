/**
 * @fileoverview Entity: MembershipData
 * @author Rami Abdou
 */

import * as CSV from 'csv-string';
import { Entity, EntityRepositoryType, ManyToOne, Property } from 'mikro-orm';

import BaseEntity from '@util/db/BaseEntity';
import MembershipQuestion from '../membership-question/MembershipQuestion';
import Membership from '../membership/Membership';
import MembershipDataRepo from './MembershipDataRepo';

@Entity({ customRepository: () => MembershipDataRepo })
export default class MembershipData extends BaseEntity {
  [EntityRepositoryType]?: MembershipDataRepo;

  // We keep this loosely defined as a string to give flexibility, especially
  // for multiple choice and multiple select values.
  @Property({ nullable: true, type: 'text' })
  value: string;

  /**
   * Although the value gets stored as string, if there are commas separating
   * the value in the DB, then we need to return it as an array IF the type
   * is DROPDOWN_MULTIPLE or MULTIPLE_CHOICE.
   */
  @Property({ persist: false })
  get parsedValue(): string | string[] {
    return ['DROPDOWN_MULTIPLE', 'MULTIPLE_CHOICE'].includes(
      this.question.type
    ) && this.value?.includes(',')
      ? CSV.parse(this.value)[0]
      : this.value;
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

  @ManyToOne(() => MembershipQuestion)
  question: MembershipQuestion;
}
