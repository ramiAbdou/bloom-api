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
import { Field, ObjectType } from 'type-graphql';

import { CommunityApplication, Event } from '@entities';
import BaseEntity from '@util/db/BaseEntity';
import { toLowerCaseDash } from '@util/util';
import MembershipQuestion from '../membership-question/MembershipQuestion';
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

  // URL to the Digital Ocean space.
  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
  @IsUrl()
  logo: string;

  @Field()
  @Property({ unique: true })
  name: string;

  @Property({ nullable: true, unique: true })
  airtableApiKey: string;

  // This access token doesn't expire, and does not have a refresh flow.
  @Property({ nullable: true, unique: true })
  mailchimpAccessToken: string;

  @Property({ nullable: true, type: 'text', unique: true })
  zoomAccessToken: string;

  @Property({ nullable: true, type: 'text', unique: true })
  zoomRefreshToken: string;

  @Property({ persist: false })
  get isInviteOnly(): boolean {
    return !this.application;
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
  @OneToOne(() => CommunityApplication, ({ community }) => community, {
    nullable: true
  })
  application: CommunityApplication;

  @OneToMany(() => Event, ({ community }) => community)
  events = new Collection<Event>(this);

  @Field(() => [Membership])
  @OneToMany(() => Membership, ({ community }) => community)
  memberships = new Collection<Membership>(this);

  // Should get the questions by the order that they are stored in the DB.
  @OneToMany(() => MembershipQuestion, ({ community }) => community, {
    orderBy: { order: QueryOrder.ASC }
  })
  questions = new Collection<MembershipQuestion>(this);
}
