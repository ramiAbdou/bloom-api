/**
 * @fileoverview Entity: Membership
 * @author Rami Abdou
 */

import {
  AfterCreate,
  BeforeCreate,
  Entity,
  Enum,
  JsonType,
  ManyToOne,
  Property
} from 'mikro-orm';
import { Field, Int, ObjectType } from 'type-graphql';

import {
  FormQuestion,
  FormQuestionCategory as Category,
  FormValue
} from '@constants';
import BaseEntity from '@util/db/BaseEntity';
import BloomManager from '@util/db/BloomManager';
import Community from '../community/Community';
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
  @Field(() => Int)
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

    return membershipForm.questions.map(({ category, title }: FormQuestion) => {
      let value: any;

      if (category === Category.FIRST_NAME) value = firstName;
      else if (category === Category.LAST_NAME) value = lastName;
      else if (category === Category.EMAIL) value = email;
      else if (category === Category.GENDER) value = gender;
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

    return membershipForm.questions.reduce(
      (acc: FormValue[], { category, title }) => {
        // Get the value from the data that lives on the Membership.
        if (!category) acc.push({ title, value: this.data[title] });
        return acc;
      },
      []
    );
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

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;

  @BeforeCreate()
  beforeCreate() {
    if (this.community.autoAccept) this.status = 1;
  }

  @AfterCreate()
  async afterCreate() {
    await new BloomManager().userRepo().sendVerificationEmail(this.user.id);
  }
}
