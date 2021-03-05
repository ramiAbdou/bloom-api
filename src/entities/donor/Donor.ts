import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Community from '@entities/community/Community';
import User from '@entities/user/User';

@ObjectType()
@Entity()
@Unique({ properties: ['community', 'email'] })
export default class Donor extends BaseEntity {
  @Field()
  @Property()
  email: string;

  @Field()
  @Property()
  firstName: string;

  @Field()
  @Property({ persist: false })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Field()
  @Property()
  lastName: string;

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;
}
