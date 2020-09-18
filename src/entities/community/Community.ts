/**
 * @fileoverview Entity: Community
 * @author Rami Abdou
 */

import { Collection, Entity, JsonType, OneToMany, Property } from 'mikro-orm';
import { Field, ObjectType } from 'type-graphql';

import { FormQuestion, GetFormQuestion } from '@constants';
import BaseEntity from '@util/db/BaseEntity';
import { toLowerCaseDash } from '@util/util';
import MembershipType from '../membership-type/MembershipType';
import Membership from '../membership/Membership';

@ObjectType()
@Entity()
export default class Community extends BaseEntity {
  // True if the membership should be accepted automatically.
  @Property({ type: Boolean })
  autoAccept = false;

  // URL to the Digital Ocean space.
  @Field(() => String, { nullable: true })
  @Property({ nullable: true, unique: true })
  logo: string;

  @Field(() => [GetFormQuestion], { nullable: true })
  @Property({ nullable: true, type: JsonType })
  membershipForm: FormQuestion[]; // Maps the title to the item.

  @Field(() => String)
  @Property({ unique: true })
  name: string;

  // A color is in the form of hex such as: #000000.
  @Field(() => String, { nullable: true })
  @Property({ nullable: true })
  primaryColor: string;

  @Field(() => String)
  @Property({ persist: false })
  get lowercaseName(): string {
    return toLowerCaseDash(this.name);
  }

  /**
   * Returns the names of all of the data attributes, which are simply stored
   * as the keys of the membershipForm record.
   */
  @Field(() => [String])
  @Property({ persist: false })
  get dataAttributes(): string[] {
    return this.membershipForm ? Object.keys(this.membershipForm) : [];
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @Field(() => [Membership])
  @OneToMany(() => Membership, ({ community }) => community)
  memberships: Collection<Membership> = new Collection<Membership>(this);

  @OneToMany(() => MembershipType, ({ community }) => community)
  membershipTypes: Collection<MembershipType> = new Collection<MembershipType>(
    this
  );
}
