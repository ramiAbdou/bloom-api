/**
 * @fileoverview Entity: Community
 * @author Rami Abdou
 */

import axios, { AxiosRequestConfig } from 'axios';
import { Field, ObjectType } from 'type-graphql';

import {
  Entity,
  EntityRepositoryType,
  OneToOne,
  Property
} from '@mikro-orm/core';
import BaseEntity from '@util/db/BaseEntity';
import Community from '../community/Community';
import { MailchimpLists } from './CommunityIntegrations.args';
import CommunityIntegrationsRepo from './CommunityIntegrations.repo';

@ObjectType()
@Entity({ customRepository: () => CommunityIntegrationsRepo })
export default class CommunityIntegrations extends BaseEntity {
  [EntityRepositoryType]?: CommunityIntegrationsRepo;

  // This access token doesn't expire, and does not have a refresh flow.
  @Property({ nullable: true, unique: true })
  mailchimpAccessToken: string;

  // Represents the audience/list that the user wants to add them as a member
  // on.
  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
  mailchimpListId: string;

  @Property({ nullable: true, unique: true })
  zapierApiKey: string;

  @Property({ nullable: true, type: 'text', unique: true })
  zoomAccessToken: string;

  @Property({ nullable: true, type: 'text', unique: true })
  zoomRefreshToken: string;

  // ## RELATIONSHIPS

  @OneToOne(() => Community, ({ integrations }) => integrations)
  community: Community;

  // ## MEMBER FUNCTIONS

  @Field(() => Boolean)
  isMailchimpAuthenticated(): boolean {
    return !!this.mailchimpAccessToken;
  }

  @Field(() => [MailchimpLists], { nullable: true })
  async mailchimpLists(): Promise<string[]> {
    if (!this.mailchimpAccessToken) return [];

    const options: AxiosRequestConfig = {
      headers: { Authorization: `OAuth ${this.mailchimpAccessToken}` },
      method: 'GET',
      url: `https://us2.api.mailchimp.com/3.0/lists`
    };

    const { data } = await axios(options);
    return data?.lists?.map(({ id, name }) => ({ id, name }));
  }
}
