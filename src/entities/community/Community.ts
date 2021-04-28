import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  Property,
  QueryOrder
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Supporter from '@entities/supporter/Supporter';
import Application from '../application/Application';
import Event from '../event/Event';
import MemberType from '../member-type/MemberType';
import Member from '../member/Member';
import Question from '../question/Question';

@ObjectType()
@Entity()
export default class Community extends BaseEntity {
  // ## FIELDS

  @Field()
  @Property({ unique: true })
  @IsUrl()
  logoUrl: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  knowledgeHubUrl?: string;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  primaryColor: string;

  /**
   * We have to persist this in the DB because we have use cases in which we
   * need to query the DB by the urlName, which we wouldn't be able to
   * do if it wasn't persisted.
   *
   * @example ColorStack => colorstack
   * @example CBAA => cbaa
   * @example MALIK Fraternity, Inc. => malik
   */
  @Field()
  @Property({ unique: true })
  urlName: string;

  // ## LIFECYCLE HOOKS

  @BeforeCreate()
  beforeCreate(): void {
    if (!this.logoUrl) {
      const DIGITAL_OCEAN_URL = process.env.DIGITAL_OCEAN_BUCKET_URL;
      this.logoUrl = `${DIGITAL_OCEAN_URL}/${this.urlName}`;
    }
  }

  // ## RELATIONSHIPS

  // If the community is invite-only, there will be no application. The only
  // way for someone to join is if the admin adds them manually.
  @Field(() => Application, { nullable: true })
  @OneToOne(() => Application, ({ community }) => community, {
    nullable: true
  })
  application: Application;

  // If the community is invite-only, there will be no application. The only
  // way for someone to join is if the admin adds them manually.
  @OneToOne({ nullable: true })
  defaultType: MemberType;

  @Field(() => [Event])
  @OneToMany(() => Event, ({ community }) => community)
  events = new Collection<Event>(this);

  @Field(() => Question)
  @OneToOne({ nullable: true })
  highlightedQuestion: Question;

  @Field(() => [Member])
  @OneToMany(() => Member, ({ community }) => community)
  members = new Collection<Member>(this);

  // Should get the questions by the order that they are stored in the DB.
  @Field(() => [MemberType])
  @OneToMany(() => MemberType, ({ community }) => community, {
    orderBy: { amount: QueryOrder.ASC }
  })
  memberTypes = new Collection<MemberType>(this);

  // Should get the questions by the order that they are stored in the DB.
  @Field(() => [Question])
  @OneToMany(() => Question, ({ community }) => community)
  questions = new Collection<Question>(this);

  @Field(() => [Supporter])
  @OneToMany(() => Supporter, ({ community }) => community)
  supporters = new Collection<Supporter>(this);

  @Field(() => Member)
  @OneToOne({ nullable: true })
  owner: Member;
}
