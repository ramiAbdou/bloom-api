/**
 * @fileoverview Entity: Membership
 * @author Rami Abdou
 */

import {
  BeforeCreate,
  Entity,
  Enum,
  JsonType,
  ManyToOne,
  Property
} from 'mikro-orm';
import { Field, ObjectType } from 'type-graphql';

import { FormQuestion, GetFormValue } from '@constants';
import BaseEntity from '@util/db/BaseEntity';
import Community from '../community/Community';
import MembershipType from '../membership-type/MembershipType';
import User from '../user/User';

@ObjectType()
@Entity()
export default class Membership extends BaseEntity {
  @Property({ nullable: true, type: JsonType })
  data: Record<string, any>; // Maps the title to the item.

  // -1: Rejected
  // 0: Pending
  // 1: Accepted
  @Field(() => Number)
  @Enum({ items: [-1, 0, 1] })
  status = 0;

  /**
   * Returns the names of all of the data attributes, which are simply stored
   * as the keys of the membershipForm record.
   */
  @Field(() => [GetFormValue])
  getFullData(): GetFormValue[] {
    if (!this.data) return [];

    const { membershipForm } = this.community;
    const { firstName, lastName, email } = this.user;
    const { name: membershipName } = this.type;

    return membershipForm.map(({ category, title }: FormQuestion) => {
      let value: any;

      if (category === 'FIRST_NAME') value = firstName;
      else if (category === 'LAST_NAME') value = lastName;
      else if (category === 'EMAIL') value = email;
      else if (category === 'MEMBERSHIP_TYPE') value = membershipName;
      else value = this.data[title];

      return { title, value };
    }, {});
  }

  /**
   * Returns the only the data that is associated with this membership, and none
   * of the user's basic data like their name and email.
   */
  @Field(() => [GetFormValue])
  getBasicMembershipData(): GetFormValue[] {
    if (!this.data) return [];

    const { membershipForm } = this.community;
    const { name: membershipName } = this.type;

    return membershipForm.reduce((acc: GetFormValue[], { category, title }) => {
      if (['FIRST_NAME', 'LAST_NAME', 'EMAIL'].includes(category)) return acc;
      if (category === 'MEMBERSHIP_TYPE')
        acc.push({ title, value: membershipName });
      else acc.push({ title, value: this.data[title] });
      return acc;
    }, []);
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

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
