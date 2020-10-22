/**
 * @fileoverview Entity: Community
 * @author Rami Abdou
 */

import { Entity, OneToOne, Property } from 'mikro-orm';
import { ObjectType } from 'type-graphql';

import BaseEntity from '@util/db/BaseEntity';
import Community from '../community/Community';

@ObjectType()
@Entity()
export default class CommunityIntegrations extends BaseEntity {
  // This access token doesn't expire, and does not have a refresh flow.
  @Property({ nullable: true, unique: true })
  mailchimpAccessToken: string;

  @Property({ nullable: true, unique: true })
  zapierApiKey: string;

  @Property({ nullable: true, type: 'text', unique: true })
  zoomAccessToken: string;

  @Property({ nullable: true, type: 'text', unique: true })
  zoomRefreshToken: string;

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @OneToOne(() => Community, ({ integrations }) => integrations)
  community: Community;
}
