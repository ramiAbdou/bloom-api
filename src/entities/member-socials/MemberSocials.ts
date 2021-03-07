import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { AfterUpdate, Entity, OneToOne, Property, wrap } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class MemberSocials extends BaseEntity {
  // ## FIELDS

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  clubhouseUrl: string;

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
  async afterUpdate() {
    await wrap(this.member).init();

    cache.invalidateKeys([
      `${QueryEvent.GET_MEMBER_SOCIALS}-${this.member.id}`,
      `${QueryEvent.GET_MEMBER_SOCIALS}-${this.member.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Member)
  @OneToOne(() => Member, ({ socials }) => socials, { owner: true })
  member: Member;
}
