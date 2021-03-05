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
import { isProduction } from '@util/constants';
import CommunityApplication from '../community-application/CommunityApplication';
import CommunityIntegrations from '../community-integrations/CommunityIntegrations';
import Event from '../event/Event';
import MemberPayment from '../member-payment/MemberPayment';
import MemberPlan from '../member-plan/MemberPlan';
import Member from '../member/Member';
import Question from '../question/Question';

@ObjectType()
@Entity()
export default class Community extends BaseEntity {
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

  // ## RELATIONSHIPS

  // If the community is invite-only, there will be no application. The only
  // way for someone to join is if the admin adds them manually.
  @Field(() => CommunityApplication, { nullable: true })
  @OneToOne(() => CommunityApplication, ({ community }) => community, {
    nullable: true
  })
  application: CommunityApplication;

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

  @Field(() => CommunityIntegrations, { nullable: true })
  @OneToOne(() => CommunityIntegrations, ({ community }) => community, {
    nullable: true
  })
  integrations: CommunityIntegrations;

  @Field(() => [Member])
  @OneToMany(() => Member, ({ community }) => community)
  members = new Collection<Member>(this);

  @Field(() => [MemberPayment])
  @OneToMany(() => MemberPayment, ({ community }) => community)
  payments = new Collection<MemberPayment>(this);

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
