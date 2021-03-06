import { Field, ObjectType } from 'type-graphql';
import { AfterUpdate, Entity, OneToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import getMailchimpAudienceName from '@integrations/mailchimp/repo/getMailchimpAudienceName';
import getMailchimpAudiences from '@integrations/mailchimp/repo/getMailchimpAudiences';
import { QueryEvent } from '@util/events';
import Community from '../community/Community';
import { MailchimpList } from './Integrations.types';

@ObjectType()
@Entity()
export default class Integrations extends BaseEntity {
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

  // ## LIFECYCLE

  @AfterUpdate()
  afterUpdate() {
    cache.invalidateKeys([
      `${QueryEvent.GET_INTEGRATIONS}-${this.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @OneToOne(() => Community, ({ integrations }) => integrations, {
    owner: true
  })
  community: Community;
}
