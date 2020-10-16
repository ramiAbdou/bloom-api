/**
 * @fileoverview Entity: CommunityApplication
 * @author Rami Abdou
 */

import { Entity, OneToOne, Property } from 'mikro-orm';
import { Field, ObjectType } from 'type-graphql';

import { Community, MembershipQuestion } from '@entities';
import BaseEntity from '@util/db/BaseEntity';

@ObjectType()
@Entity()
export default class CommunityApplication extends BaseEntity {
  @Field()
  @Property({ type: 'text' })
  description: string;

  @Field()
  @Property()
  title: string;

  @Field(() => [MembershipQuestion])
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
  @OneToOne(() => Community, ({ application }) => application, { owner: true })
  community: Community;
}
