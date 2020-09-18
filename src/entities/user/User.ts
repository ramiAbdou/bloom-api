/**
 * @fileoverview Entity: User
 * @author Rami Abdou
 */

import { BeforeCreate, Entity, Enum, Property } from 'mikro-orm';
import { Field, ObjectType } from 'type-graphql';

import BaseEntity from '@util/db/BaseEntity';

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
  @Property({ type: 'text' })
  bio = '';

  @Field(() => String)
  @Property({ nullable: false, unique: true })
  email: string;

  @Field(() => String, { nullable: true })
  @Property({ nullable: true })
  facebookUrl: string;

  @Field(() => String)
  @Property()
  firstName: string;

  @Field(() => String)
  @Enum({ items: ['Male', 'Female', 'Non-Binary'] })
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
}
