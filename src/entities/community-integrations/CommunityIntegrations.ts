import axios, { AxiosRequestConfig } from 'axios';
import { Field, ObjectType } from 'type-graphql';
import {
  Entity,
  EntityRepositoryType,
  OneToOne,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
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

  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
  stripeAccountId: string;

  @Property({ nullable: true, unique: true })
  zapierApiKey: string;

  // ## RELATIONSHIPS

  @OneToOne(() => Community, ({ integrations }) => integrations)
  community: Community;

  // ## MEMBER FUNCTIONS
  // ## MAILCHIMP

  @Field(() => Boolean)
  isMailchimpAuthenticated(): boolean {
    return !!this.mailchimpAccessToken;
  }

  @Field(() => String, { nullable: true })
  async mailchimpListName(): Promise<string[]> {
    const { mailchimpAccessToken, mailchimpListId } = this;
    if (!mailchimpAccessToken || !mailchimpListId) return null;

    const options: AxiosRequestConfig = {
      headers: { Authorization: `OAuth ${mailchimpAccessToken}` },
      method: 'GET',
      url: `https://us2.api.mailchimp.com/3.0/lists/${mailchimpListId}`
    };

    const { data } = await axios(options);
    return data?.name;
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
