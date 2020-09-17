/**
 * @fileoverview Entity: Membership
 * @author Rami Abdou
 */

import { BeforeCreate, Entity, Enum, ManyToOne } from 'mikro-orm';

import BaseEntity from '@util/db/BaseEntity';
import Community from '../community/Community';
import MembershipType from '../membership-type/MembershipType';
import User from '../user/User';

@Entity()
export default class Membership extends BaseEntity {
  constructor(user: User, community: Community) {
    super();
    this.user = user;
    this.community = community;
  }

  // -1: Rejected
  // 0: Pending
  // 1: Accepted
  @Enum({ items: [-1, 0, 1] })
  status = 0;

  @ManyToOne(() => MembershipType)
  type: MembershipType;

  @ManyToOne(() => Community)
  community: Community;

  @ManyToOne(() => User)
  user: User;

  @BeforeCreate()
  beforeCreate() {
    if (this.community.autoAccept) this.status = 1;
  }
}
