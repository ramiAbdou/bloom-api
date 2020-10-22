/**
 * @fileoverview Entity: Community
 * @author Rami Abdou
 */

import { IsUrl } from 'class-validator';
import {
  BeforeCreate,
  Collection,
  Entity,
  EntityRepositoryType,
  OneToMany,
  OneToOne,
  Property,
  QueryOrder
} from 'mikro-orm';
import { Authorized, Field, ObjectType } from 'type-graphql';

import BaseEntity from '@util/db/BaseEntity';
import { toLowerCaseDash } from '@util/util';
import CommunityApplication from '../community-application/CommunityApplication';
import CommunityIntegrations from '../community-integrations/CommunityIntegrations';
import Event from '../event/Event';
import MembershipCardItem from '../membership-card-item/MembershipCardItem';
import MembershipQuestion from '../membership-question/MembershipQuestion';
import MembershipType from '../membership-type/MembershipType';
import Membership from '../membership/Membership';
import CommunityRepo from './CommunityRepo';

@ObjectType()
@Entity({ customRepository: () => CommunityRepo })
export default class Community extends BaseEntity {
  [EntityRepositoryType]?: CommunityRepo;

  // True if the membership should be accepted automatically.
  @Property({ type: Boolean })
  autoAccept = false;

  /**
   * We have to persist this in the DB because we have use cases in which we
   * need to query the DB by the encodedUrlName, which we wouldn't be able to
   * do if it wasn't persisted.
   *
   * @example ColorStack => colorstack
   */
  @Field()
  @Property({ unique: true })
  encodedUrlName: string;

  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
  @IsUrl()
  logoUrl: string;

  @Field()
  @Property({ unique: true })
  name: string;

  @Property({ persist: false })
  get isInviteOnly(): boolean {
    return !this.application;
  }

  @Authorized('ADMIN')
  @Property({ persist: false })
  get pendingApplications(): Membership[] {
    return this.memberships
      .getItems()
      .filter(({ status }) => status === 'PENDING');
  }

  @BeforeCreate()
  beforeCreate() {
    this.encodedUrlName = toLowerCaseDash(this.name);
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  // If the community is invite-only, there will be no application. The only
  // way for someone to join is if the admin adds them manually.
  @Field(() => CommunityApplication, { nullable: true })
  @OneToOne(() => CommunityApplication, ({ community }) => community, {
    nullable: true,
    owner: true
  })
  application: CommunityApplication;

  @OneToMany(() => Event, ({ community }) => community)
  events = new Collection<Event>(this);

  @Field(() => CommunityIntegrations, { nullable: true })
  @OneToOne(() => CommunityIntegrations, ({ community }) => community, {
    nullable: true,
    owner: true
  })
  integrations: CommunityIntegrations;

  @Field(() => [Membership])
  @OneToMany(() => Membership, ({ community }) => community)
  memberships = new Collection<Membership>(this);

  @OneToMany(() => MembershipCardItem, ({ community }) => community, {
    orderBy: { order: QueryOrder.ASC }
  })
  membershipCard = new Collection<MembershipCardItem>(this);

  // Should get the questions by the order that they are stored in the DB.
  @Field(() => [MembershipQuestion])
  @OneToMany(() => MembershipQuestion, ({ community }) => community, {
    orderBy: { order: QueryOrder.ASC }
  })
  questions = new Collection<MembershipQuestion>(this);

  // Should get the questions by the order that they are stored in the DB.
  @OneToMany(() => MembershipType, ({ community }) => community, {
    orderBy: { amount: QueryOrder.ASC }
  })
  types = new Collection<MembershipType>(this);
}
