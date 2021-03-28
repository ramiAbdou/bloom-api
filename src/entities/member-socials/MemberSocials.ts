import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { AfterUpdate, Entity, OneToOne, Property, wrap } from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import { QueryEvent } from '@util/constants.events';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class MemberSocials extends BaseEntity {
  static cache: Cache = new Cache();

  // ## FIELDS

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  facebookUrl: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  instagramUrl: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  linkedInUrl: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  twitterUrl: string;

  // ## LIFECYCLE HOOKS

  @AfterUpdate()
  async afterUpdate(): Promise<void> {
    await wrap(this.member).init();

    MemberSocials.cache.invalidate([
      `${QueryEvent.GET_MEMBER_SOCIALS}-${this.member.id}`,
      `${QueryEvent.LIST_MEMBER_SOCIALS}-${this.member.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Member)
  @OneToOne(() => Member, ({ socials }) => socials, { owner: true })
  member: Member;
}
