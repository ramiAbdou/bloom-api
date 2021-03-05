import { Field, ObjectType } from 'type-graphql';
import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Community from '@entities/community/Community';
import RankedQuestion from '../ranked-question/RankedQuestion';

@ObjectType()
@Entity()
export default class Application extends BaseEntity {
  @Field()
  @Property({ type: 'text' })
  description: string;

  @Field()
  @Property()
  title: string;

  // ## RELATIONSHIPS

  @Field(() => Community)
  @OneToOne(() => Community, ({ application }) => application, { owner: true })
  community: Community;

  // Should get the questions by the order that they are stored in the DB.
  @Field(() => [RankedQuestion])
  @OneToMany(() => RankedQuestion, ({ application }) => application)
  questions = new Collection<RankedQuestion>(this);
}
