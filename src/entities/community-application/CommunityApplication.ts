import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  Entity,
  EntityRepositoryType,
  OneToOne,
  Property
} from '@mikro-orm/core';

import { Community, MembershipQuestion } from '@entities';
import BaseEntity from '@core/db/BaseEntity';
import BaseRepo from '@core/db/BaseRepo';

@ObjectType()
@Entity()
export default class CommunityApplication extends BaseEntity {
  [EntityRepositoryType]?: BaseRepo<CommunityApplication>;

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

  @OneToOne(() => Community, ({ application }) => application)
  community: Community;
}
