import { Field, Float, ObjectType } from 'type-graphql';
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { Community, Member } from '@entities/entities';

@ObjectType()
@Entity()
export default class MemberType extends BaseEntity {
  @Field(() => Float)
  @Property({ type: Number })
  amount = 0.0;

  @Field(() => Boolean)
  @Property({ type: Boolean })
  isDefault = false;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property({ persist: false })
  get isFree(): boolean {
    return this.amount > 0.0;
  }

  @ManyToOne(() => Community)
  community: Community;

  @OneToMany(() => Member, ({ type }) => type)
  members = new Collection<Member>(this);
}
