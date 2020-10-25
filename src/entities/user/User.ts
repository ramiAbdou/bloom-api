/**
 * @fileoverview Entity: User
 * @author Rami Abdou
 */

import { IsEmail, IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';

import {
  BeforeCreate,
  Cascade,
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  OneToMany,
  Property
} from '@mikro-orm/core';
import BaseEntity from '@util/db/BaseEntity';
import Membership from '../membership/Membership';
import UserRepo from './User.repo';

@ObjectType()
@Entity({ customRepository: () => UserRepo })
export default class User extends BaseEntity {
  [EntityRepositoryType]?: UserRepo;

  /* 
  ___ _     _    _    
 | __(_)___| |__| |___
 | _|| / -_) / _` (_-<
 |_| |_\___|_\__,_/__/
  */

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

  // Server-generated token that we use to keep the user logged-in when sending
  // GraphQL requests.
  @Property({ nullable: true })
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

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @Field(() => [Membership])
  @OneToMany(() => Membership, ({ user }) => user, { cascade: [Cascade.ALL] })
  memberships: Collection<Membership> = new Collection<Membership>(this);
}
