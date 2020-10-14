/**
 * @fileoverview Entity: Membership
 * @author Rami Abdou
 */

import {
  AfterCreate,
  BeforeCreate,
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  ManyToOne,
  OneToMany
} from 'mikro-orm';
import { Field, Int, ObjectType } from 'type-graphql';

import { APP } from '@constants';
import BaseEntity from '@util/db/BaseEntity';
import { sendEmail, VERIFICATION_EMAIL_ARGS } from '@util/emails';
import { ValidateEmailData } from '@util/emails/types';
import Community from '../community/Community';
import MembershipData from '../membership-data/MembershipData';
import MembershipPayment from '../membership-payment/MembershipPayment';
import MembershipType from '../membership-type/MembershipType';
import User from '../user/User';
import { MembershipRole } from './MembershipArgs';
import MembershipRepo from './MembershipRepo';

@ObjectType()
@Entity({ customRepository: () => MembershipRepo })
export default class Membership extends BaseEntity {
  [EntityRepositoryType]?: MembershipRepo;

  /**
   * @example ADMIN
   * @example OWNER
   */
  @Enum({ items: ['ADMIN', 'OWNER'], nullable: true, type: String })
  role: MembershipRole;

  // -1: REJECTED
  // 0: PENDING
  // 1: APPROVED
  @Field(() => Int)
  @Enum({ items: [-1, 0, 1], type: Number })
  status = 0;

  @BeforeCreate()
  beforeCreate() {
    if (this.community.autoAccept) this.status = 1;
  }

  @AfterCreate()
  async afterCreate() {
    await sendEmail({
      ...VERIFICATION_EMAIL_ARGS,
      to: this.user.email,
      verificationUrl: `${APP.SERVER_URL}/users/${this.user.id}/verify`
    } as ValidateEmailData);
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne()
  community: Community;

  @OneToMany(() => MembershipData, ({ membership }) => membership)
  data = new Collection<MembershipData>(this);

  @OneToMany(() => MembershipPayment, ({ membership }) => membership)
  payments = new Collection<MembershipPayment>(this);

  @ManyToOne()
  type: MembershipType;

  @Field(() => User)
  @ManyToOne()
  user: User;
}
