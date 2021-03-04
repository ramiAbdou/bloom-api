import { IsEmail, IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  Collection,
  Entity,
  OneToMany,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class User extends BaseEntity {
  // ## FIELDS

  @Field()
  @Property({ unique: true })
  @IsEmail()
  email: string;

  @Property({ nullable: true })
  firstName?: string;

  @Field()
  @Property({ persist: false })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Property({ nullable: true })
  lastName: string;

  // Server-generated token that we use to keep the user logged-in when sending
  // GraphQL requests.
  @Property({ nullable: true, type: 'text', unique: true })
  refreshToken: string;

  // ## SOCIAL MEDIA INFORMATION

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  clubhouseUrl: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  facebookUrl: string;

  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
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

  // ## LIFECYCLE

  @BeforeCreate()
  async beforeCreate() {
    this.email = this.email.toLowerCase();
  }

  // ## RELATIONSHIPS

  @Field(() => [Member])
  @OneToMany(() => Member, ({ user }) => user)
  members: Collection<Member> = new Collection<Member>(this);
}
