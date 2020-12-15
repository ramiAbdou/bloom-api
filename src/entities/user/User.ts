import { IsEmail, IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  Cascade,
  Collection,
  Entity,
  Enum,
  OneToMany,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class User extends BaseEntity {
  // ## FIELDS

  @Field({ nullable: true })
  @Property({ nullable: true })
  currentLocation: string;

  @Field()
  @Property({ unique: true })
  @IsEmail()
  email: string;

  @Field()
  @Property()
  firstName: string;

  @Field({ nullable: true })
  @Enum({
    items: ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'],
    nullable: true,
    type: String
  })
  gender: string;

  @Field()
  @Property()
  lastName: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  pictureUrl: string;

  // Server-generated token that we use to keep the user logged-in when sending
  // GraphQL requests.
  @Property({ nullable: true, type: 'text' })
  refreshToken: string;

  /**
   * SOCIAL MEDIA INFORMATION
   */

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

  @BeforeCreate()
  beforeCreate() {
    this.email = this.email.toLowerCase();
    this.firstName = this.firstName.trim();
    this.lastName = this.lastName.trim();
  }

  @Field()
  @Property({ persist: false })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // ## RELATIONSHIPS

  @Field(() => [Member])
  @OneToMany(() => Member, ({ user }) => user, { cascade: [Cascade.ALL] })
  members: Collection<Member> = new Collection<Member>(this);
}
