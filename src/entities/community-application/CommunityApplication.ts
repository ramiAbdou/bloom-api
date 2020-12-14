import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Entity, OneToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { Community, Question } from '@entities/entities';

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
  @Field(() => [Question])
  @Property({ persist: false })
  get questions(): Question[] {
    return this.community.questions
      .getItems()
      .filter(({ inApplication }) => inApplication);
  }

  // ## RELATIONSHIPS

  @OneToOne(() => Community, ({ application }) => application)
  community: Community;
}
