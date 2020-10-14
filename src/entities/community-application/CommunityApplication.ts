/**
 * @fileoverview Entity: CommunityApplication
 * @author Rami Abdou
 */

import { Entity, OneToOne, Property } from 'mikro-orm';

import { Community, MembershipQuestion } from '@entities';
import BaseEntity from '@util/db/BaseEntity';

@Entity()
export default class CommunityApplication extends BaseEntity {
  @Property({ type: 'text' })
  description: string;

  @Property()
  title: string;

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

  // Owning side of the relationship.
  @OneToOne()
  community: Community;
}
