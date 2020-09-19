/**
 * @fileoverview Entity: User
 * @author Rami Abdou
 */

import {
  BeforeCreate,
  Cascade,
  Collection,
  Entity,
  Enum,
  OneToMany,
  Property
} from 'mikro-orm';
import { Field, ObjectType } from 'type-graphql';

import BaseEntity from '@util/db/BaseEntity';
import Membership from '../membership/Membership';

@ObjectType()
@Entity()
export default class User extends BaseEntity {
  /* 
  ___ _     _    _    
 | __(_)___| |__| |___
 | _|| / -_) / _` (_-<
 |_| |_\___|_\__,_/__/
  */

  @Field(() => String, { nullable: true })
  @Property({ nullable: true, type: 'text' })
  bio: string;

  @Field(() => String)
  @Property({ nullable: false, unique: true })
  email: string;

  @Field(() => String, { nullable: true })
  @Property({ nullable: true })
  facebookUrl: string;

  @Field(() => String)
  @Property()
  firstName: string;

  @Field(() => String, { nullable: true })
  @Enum({
    items: ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'],
    nullable: true,
    type: String
  })
  gender: string;

  @Field(() => String, { nullable: true })
  @Property({ nullable: true, unique: true })
  igUrl: string;

  @Field(() => String)
  @Property()
  lastName: string;

  @Field(() => String, { nullable: true })
  @Property({ nullable: true })
  linkedInUrl: string;

  @Field(() => String, { nullable: true })
  @Property({ nullable: true })
  twitterUrl: string;

  @BeforeCreate()
  beforeCreate() {
    this.email = this.email.toLowerCase();
    this.firstName = this.firstName.trim();
    this.lastName = this.lastName.trim();
  }

  @Field(() => String)
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

  @OneToMany(() => Membership, ({ user }) => user, { cascade: [Cascade.ALL] })
  memberships: Collection<Membership> = new Collection<Membership>(this);
}
