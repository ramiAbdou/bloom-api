import { Field, ObjectType } from 'type-graphql';
import { AfterUpdate, Entity, OneToOne, Property } from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import getMailchimpAudienceName from '@integrations/mailchimp/repo/getMailchimpAudienceName';
import getMailchimpAudiences from '@integrations/mailchimp/repo/getMailchimpAudiences';
import { QueryEvent } from '@util/events';
import Community from '../community/Community';
import { MailchimpList } from './CommunityIntegrations.types';

@ObjectType()
@Entity()
export default class CommunityIntegrations extends BaseEntity {
  static cache: Cache = new Cache();

  // ## FIELDS

  @Property({ nullable: true })
  mailchimpAccessToken?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  mailchimpListId?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  stripeAccountId?: string;

  @Property({ nullable: true })
  zapierApiKey: string;

  // ## METHODS

  @Field()
  isMailchimpAuthenticated(): boolean {
    return !!this.mailchimpAccessToken;
  }

  @Field(() => String, { nullable: true })
  async mailchimpListName(): Promise<string> {
    return getMailchimpAudienceName({
      mailchimpAccessToken: this.mailchimpAccessToken,
      mailchimpListId: this.mailchimpListId
    });
  }

  @Field(() => [MailchimpList], { nullable: true })
  async mailchimpLists(): Promise<MailchimpList[]> {
    return getMailchimpAudiences({
      mailchimpAccessToken: this.mailchimpAccessToken
    });
  }

  // ## LIFECYCLE HOOKS

  @AfterUpdate()
  afterUpdate() {
    CommunityIntegrations.cache.invalidateKeys([
      `${QueryEvent.GET_INTEGRATIONS}-${this.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @OneToOne(
    () => Community,
    ({ communityIntegrations }) => communityIntegrations,
    { owner: true }
  )
  community: Community;
}
