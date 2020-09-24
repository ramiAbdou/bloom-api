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

import {
  FormQuestion,
  FormQuestionCategory as Category,
  FormValue
} from '@constants';
import BaseEntity from '@util/db/BaseEntity';
import Community from '../community/Community';
import MembershipType from '../membership-type/MembershipType';
import User from '../user/User';

@ObjectType()
@Entity()
export default class Membership extends BaseEntity {
  // Maps the title to the value.
  @Property({ nullable: true, type: JsonType })
  data: Record<string, any>;

  // -1: Rejected
  // 0: Pending
  // 1: Accepted
  @Field(() => Number)
  @Enum({ items: [-1, 0, 1], type: Number })
  status = 0;

  /**
   * Returns the full data of the membership including the user's basic
   * information like First Name, Last Name, etc.
   */
  @Field(() => [FormValue])
  getFullData(): FormValue[] {
    if (!this.data) return [];

    const { membershipForm } = this.community;
    const { gender, firstName, lastName, email } = this.user;
    const { name: membershipName } = this.type;

    return membershipForm.map(({ category, title }: FormQuestion) => {
      let value: any;

      if (category === Category.FIRST_NAME) value = firstName;
      else if (category === Category.LAST_NAME) value = lastName;
      else if (category === Category.EMAIL) value = email;
      else if (category === Category.GENDER) value = gender;
      else if (category === Category.MEMBERSHIP_TYPE) value = membershipName;
      else value = this.data[title];

      return { title, value };
    });
  }

  /**
   * Returns the only the data that is associated with this membership, and none
   * of the data that lives on the User entity.
   */
  @Field(() => [FormValue])
  getBasicMembershipData(): FormValue[] {
    if (!this.data) return [];

    const { membershipForm } = this.community;
    const { name: membershipName } = this.type;

    return membershipForm.reduce((acc: FormValue[], { category, title }) => {
      // If it's the membership type, push that value from the entity.
      if (category === Category.MEMBERSHIP_TYPE)
        acc.push({ title, value: membershipName });
      // Otherwise, get the value from the data that lives on the Membership.
      else if (!category) acc.push({ title, value: this.data[title] });
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

  @ManyToOne(() => Community)
  community: Community;

  @ManyToOne(() => MembershipType)
  type: MembershipType;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;

  @BeforeCreate()
  beforeCreate() {
    if (this.community.autoAccept) this.status = 1;
  }
}
