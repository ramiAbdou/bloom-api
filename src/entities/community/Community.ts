import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  AfterUpdate,
  BeforeCreate,
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  Property,
  QueryOrder
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import Supporter from '@entities/supporter/Supporter';
import { isProduction } from '@util/constants';
import { QueryEvent } from '@util/events';
import Application from '../application/Application';
import Event from '../event/Event';
import Integrations from '../integrations/Integrations';
import MemberPlan from '../member-plan/MemberPlan';
import Member from '../member/Member';
import Payment from '../payment/Payment';
import Question from '../question/Question';

@ObjectType()
@Entity()
export default class Community extends BaseEntity {
  static cache: Cache = new Cache();

  // ## FIELDS

  // True if the member should be accepted automatically.
  @Field({ defaultValue: false })
  @Property()
  autoAccept: boolean = false;

  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
  @IsUrl()
  logoUrl?: string;

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

  // ## METHODS

  async getCacheIdenitifers(): Promise<string[]> {
    const members: Member[] = await this.members.loadItems();

    return [
      this.id,
      this.urlName,
      ...members.map((member: Member) => member.user.id)
    ];
  }

  // ## LIFECYCLE HOOKS

  @BeforeCreate()
  beforeCreate() {
    if (!this.logoUrl) {
      const DIGITAL_OCEAN_URL = isProduction
        ? process.env.DIGITAL_OCEAN_BUCKET_URL
        : process.env.DIGITAL_OCEAN_TEST_BUCKET_URL;

      this.logoUrl = `${DIGITAL_OCEAN_URL}/${this.urlName}`;
    }
  }

  @AfterUpdate()
  async afterUpdate() {
    const cacheIds: string[] = await this.getCacheIdenitifers();

    const cacheKeys = cacheIds.map((cacheId: string) => {
      return `${QueryEvent.GET_COMMUNITIES}-${cacheId}`;
    });

    Community.cache.invalidateKeys(cacheKeys);
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
  defaultType: MemberPlan;

  @Field(() => [Event])
  @OneToMany(() => Event, ({ community }) => community)
  events = new Collection<Event>(this);

  @Field(() => Question)
  @OneToOne({ nullable: true })
  highlightedQuestion: Question;

  @Field(() => Integrations, { nullable: true })
  @OneToOne(() => Integrations, ({ community }) => community, {
    nullable: true
  })
  integrations: Integrations;

  @Field(() => [Member])
  @OneToMany(() => Member, ({ community }) => community)
  members = new Collection<Member>(this);

  @Field(() => [Payment])
  @OneToMany(() => Payment, ({ community }) => community)
  payments = new Collection<Payment>(this);

  // Should get the questions by the order that they are stored in the DB.
  @Field(() => [MemberPlan])
  @OneToMany(() => MemberPlan, ({ community }) => community, {
    orderBy: { amount: QueryOrder.ASC }
  })
  plans = new Collection<MemberPlan>(this);

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
