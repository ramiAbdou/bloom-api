import { Field, ObjectType } from 'type-graphql';
import { Entity, OneToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { Community } from '@entities/entities';

@ObjectType()
@Entity()
export default class CommunityApplication extends BaseEntity {
  @Field()
  @Property({ type: 'text' })
  description: string;

  @Field()
  @Property()
  title: string;

  // ## RELATIONSHIPS

  @Field(() => Community)
  @OneToOne(() => Community, ({ application }) => application)
  community: Community;
}
