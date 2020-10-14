/**
 * @fileoverview Entity: MembershipQuestion
 * @author Rami Abdou
 */

import { Entity, Enum, ManyToOne, Property } from 'mikro-orm';

import { Community } from '@entities';
import BaseEntity from '@util/db/BaseEntity';

type QuestionType = 'SHORT_TEXT' | 'LONG_TEXT' | 'DROPDOWN';
type SpecialQuestion = 'FIRST_NAME' | 'LAST_NAME' | 'EMAIL';

@Entity()
export default class MembershipQuestion extends BaseEntity {
  @Property({ nullable: true })
  description: string;

  @Property({ type: Boolean })
  inApplication = true;

  @Property()
  order: number;

  @Property({ type: Boolean })
  required = true;

  @Enum({ items: ['FIRST_NAME', 'LAST_NAME', 'EMAIL'] })
  special: SpecialQuestion;

  @Property()
  title: string;

  @Enum({ items: ['SHORT_TEXT', 'LONG_TEXT', 'DROPDOWN'] })
  type: QuestionType;

  @Property({ persist: false })
  get questions(): MembershipQuestion[] {
    return this.community.questions
      .getItems()
      .filter(({ inApplication }) => inApplication);
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne()
  community: Community;
}
