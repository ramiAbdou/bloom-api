/**
 * @fileoverview Entity: Community
 * @author Rami Abdou
 */

import { ObjectType } from 'type-graphql';

import {
  Entity,
  EntityRepositoryType,
  OneToOne,
  Property
} from '@mikro-orm/core';
import BaseEntity from '@util/db/BaseEntity';
import BaseRepo from '@util/db/BaseRepo';
import Community from '../community/Community';

@ObjectType()
@Entity()
export default class CommunityIntegrations extends BaseEntity {
  [EntityRepositoryType]?: BaseRepo<CommunityIntegrations>;

  // This access token doesn't expire, and does not have a refresh flow.
  @Property({ nullable: true, unique: true })
  mailchimpAccessToken: string;

  @Property({ nullable: true, unique: true })
  zapierApiKey: string;

  @Property({ nullable: true, type: 'text', unique: true })
  zoomAccessToken: string;

  @Property({ nullable: true, type: 'text', unique: true })
  zoomRefreshToken: string;

  // ## RELATIONSHIPS

  @OneToOne(() => Community, ({ integrations }) => integrations)
  community: Community;
}
