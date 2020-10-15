/**
 * @fileoverview Entity: MembershipQuestion
 * @author Rami Abdou
 */

import { Entity, Enum, ManyToOne, Property } from 'mikro-orm';

import { Community } from '@entities';
import BaseEntity from '@util/db/BaseEntity';
import { QuestionCategory, QuestionType } from '@util/gql';

@Entity()
export default class MembershipQuestion extends BaseEntity {
  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // membership.
  @Enum({
    items: ['EMAIL', 'FIRST_NAME', 'GENDER', 'LAST_NAME', 'MEMBERSHIP_TYPE'],
    nullable: true
  })
  category: QuestionCategory;

  @Property({ nullable: true })
  description: string;

  // If set to false, this question will not appear in the community's
  // membership application form.
  @Property({ type: Boolean })
  inApplication = true;

  // Order that the question appears. Similar to an index in an array.
  @Property()
  order: number;

  @Property({ type: Boolean })
  required = true;

  @Property()
  title: string;

  @Enum({
    default: 'SHORT_TEXT',
    items: ['SHORT_TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'DROPDOWN_MULTIPLE']
  })
  type: QuestionType;

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne(() => Community)
  community: Community;
}
