/**
 * @fileoverview Entity: CommunityApplication
 * @author Rami Abdou
 */

import { IsUrl } from 'class-validator';
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

  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  @IsUrl()
  imageUrl: string;

  @Field()
  @Property()
  title: string;

  // Filters all of the community questions that should be in the application.
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
  @OneToOne({ mappedBy: ({ application }) => application })
  community: Community;
}
