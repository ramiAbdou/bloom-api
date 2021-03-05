import { IsEmail } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  Collection,
  Entity,
  OneToMany,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Supporter from '@entities/supporter/Supporter';
import Donor from '../donor/Donor';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class User extends BaseEntity {
  // ## FIELDS

  @Field()
  @Property({ unique: true })
  @IsEmail()
  email: string;

  // Server-generated token that we use to keep the user logged-in when sending
  // GraphQL requests.
  @Property({ nullable: true, type: 'text', unique: true })
  refreshToken: string;

  // ## LIFECYCLE

  @BeforeCreate()
  async beforeCreate() {
    this.email = this.email.toLowerCase();
  }

  // ## RELATIONSHIPS

  @Field(() => [Donor])
  @OneToMany(() => Donor, ({ user }) => user)
  donors: Collection<Donor> = new Collection<Donor>(this);

  @Field(() => [Member])
  @OneToMany(() => Member, ({ user }) => user)
  members: Collection<Member> = new Collection<Member>(this);

  @Field(() => [Supporter])
  @OneToMany(() => Supporter, ({ user }) => user)
  supporters: Collection<Supporter> = new Collection<Supporter>(this);
}
