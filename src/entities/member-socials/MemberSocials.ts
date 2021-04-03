import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Entity, OneToOne, Property } from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
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

  // ## RELATIONSHIPS

  @Field(() => Member)
  @OneToOne(() => Member, ({ socials }) => socials, { owner: true })
  member: Member;
}
