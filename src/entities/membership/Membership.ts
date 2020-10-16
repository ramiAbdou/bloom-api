/**
 * @fileoverview Entity: Membership
 * @author Rami Abdou
 */

import {
  BeforeCreate,
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  ManyToOne,
  OneToMany,
  Property
} from 'mikro-orm';
import { Field, ObjectType } from 'type-graphql';

import BaseEntity from '@util/db/BaseEntity';
import { now } from '@util/util';
import Community from '../community/Community';
import MembershipData from '../membership-data/MembershipData';
import MembershipPayment from '../membership-payment/MembershipPayment';
import MembershipType from '../membership-type/MembershipType';
import User from '../user/User';
import { MembershipRole } from './MembershipArgs';
import MembershipRepo from './MembershipRepo';

export type MembershipStatus = 'REJECTED' | 'PENDING' | 'APPROVED';

@ObjectType()
@Entity({ customRepository: () => MembershipRepo })
export default class Membership extends BaseEntity {
  [EntityRepositoryType]?: MembershipRepo;

  @Field()
  @Property()
  joinedOn: string = now();

  /**
   * @example ADMIN
   * @example OWNER
   */
  @Enum({ items: ['ADMIN', 'OWNER'], nullable: true, type: String })
  role: MembershipRole;

  @Field(() => String)
  @Enum({ items: ['REJECTED', 'PENDING', 'APPROVED'], type: String })
  status: MembershipStatus = 'PENDING';

  @BeforeCreate()
  beforeCreate() {
    if (this.community.autoAccept) this.status = 'APPROVED';
    if (!this.type) this.type = this.community.defaultMembership();
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne(() => Community)
  community: Community;

  // Data will only be populated if a question has ever been answered before.
  @OneToMany(() => MembershipData, ({ membership }) => membership)
  data = new Collection<MembershipData>(this);

  @OneToMany(() => MembershipPayment, ({ membership }) => membership)
  payments = new Collection<MembershipPayment>(this);

  @ManyToOne(() => MembershipType)
  type: MembershipType;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;
}
