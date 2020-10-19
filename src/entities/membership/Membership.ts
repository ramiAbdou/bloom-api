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

import { MembershipQuestion } from '@entities';
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

  @Field(() => [MembershipData])
  @Property({ persist: false })
  get fullData(): MembershipData[] {
    const data = this.data.getItems();
    const { email, gender, firstName, lastName } = this.user;

    // @ts-ignore b/c this will only be queried in certain cases.
    return this.community.questions
      .getItems()
      .map(({ category, order, title, type }: MembershipQuestion) => {
        let value: string;
        const result = data.find(({ question }) => question.title === title);

        if (result) value = result.value;
        else if (category === 'DATE_JOINED') value = this.joinedOn;
        else if (category === 'EMAIL') value = email;
        else if (category === 'FIRST_NAME') value = firstName;
        else if (category === 'GENDER') value = gender;
        else if (category === 'LAST_NAME') value = lastName;
        else if (category === 'MEMBERSHIP_TYPE') value = this.type.name;

        return { question: { order, title, type }, value };
      });
  }

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
  @Field(() => [MembershipData])
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
