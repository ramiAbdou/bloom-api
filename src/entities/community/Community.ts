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

import { INTEGRATIONS } from '@constants';
import BaseEntity from '@core/db/BaseEntity';
import { toLowerCaseDash } from '@util/util';
import CommunityApplication from '../community-application/CommunityApplication';
import CommunityIntegrations from '../community-integrations/CommunityIntegrations';
import MemberType from '../member-type/MemberType';
import Member from '../member/Member';
import Question from '../question/Question';

const { DIGITAL_OCEAN_SPACE_URL } = INTEGRATIONS;

@ObjectType()
@Entity()
export default class Community extends BaseEntity {
  // ## FIELDS

  // True if the member should be accepted automatically.
  @Field(() => Boolean)
  @Property({ type: Boolean })
  autoAccept = false;

  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
  @IsUrl()
  logoUrl: string;

  @Field()
  @Property({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
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
    if (!this.urlName) this.urlName = toLowerCaseDash(this.name);
    if (!this.logoUrl) {
      this.logoUrl = `${DIGITAL_OCEAN_SPACE_URL}/${this.urlName}.png`;
    }
  }

  // ## RELATIONSHIPS

  // If the community is invite-only, there will be no application. The only
  // way for someone to join is if the admin adds them manually.
  @Field(() => CommunityApplication, { nullable: true })
  @OneToOne(() => CommunityApplication, ({ community }) => community, {
    nullable: true,
    owner: true
  })
  application: CommunityApplication;

  // If the community is invite-only, there will be no application. The only
  // way for someone to join is if the admin adds them manually.
  @OneToOne({ nullable: true })
  defaultType: MemberType;

  @Field(() => CommunityIntegrations, { nullable: true })
  @OneToOne(() => CommunityIntegrations, ({ community }) => community, {
    nullable: true,
    owner: true
  })
  integrations: CommunityIntegrations;

  @Field(() => [Member])
  @OneToMany(() => Member, ({ community }) => community)
  members = new Collection<Member>(this);

  // Should get the questions by the order that they are stored in the DB.
  @Field(() => [Question])
  @OneToMany(() => Question, ({ community }) => community, {
    orderBy: { order: QueryOrder.ASC }
  })
  questions = new Collection<Question>(this);

  // Should get the questions by the order that they are stored in the DB.
  @Field(() => [MemberType])
  @OneToMany(() => MemberType, ({ community }) => community, {
    orderBy: { amount: QueryOrder.ASC }
  })
  types = new Collection<MemberType>(this);
}
