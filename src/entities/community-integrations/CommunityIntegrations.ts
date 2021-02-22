import { Field, ObjectType } from 'type-graphql';
import { Entity, OneToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import getMailchimpAudienceName from '@integrations/mailchimp/repo/getMailchimpAudienceName';
import getMailchimpAudiences from '@integrations/mailchimp/repo/getMailchimpAudiences';
import Community from '../community/Community';
import { MailchimpList } from './CommunityIntegrations.types';

@ObjectType()
@Entity()
export default class CommunityIntegrations extends BaseEntity {
  @Property({ nullable: true, unique: true })
  mailchimpAccessToken?: string;

  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
  mailchimpListId?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  stripeAccountId?: string;

  @Property({ nullable: true, unique: true })
  zapierApiKey: string;

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

  // ## RELATIONSHIPS

  @Field(() => Community)
  @OneToOne(() => Community, ({ integrations }) => integrations, {
    owner: true
  })
  community: Community;
}
