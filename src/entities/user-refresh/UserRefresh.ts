import { ObjectType } from 'type-graphql';
import { Entity, ManyToOne } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import User from '../user/User';

@ObjectType()
@Entity()
export default class UserRefresh extends BaseEntity {
  @ManyToOne(() => User)
  user: User;
}
