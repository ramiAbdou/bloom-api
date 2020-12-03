import { Field, ObjectType } from 'type-graphql';
import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@util/db/BaseEntity';
import MembershipQuestion from '../membership-question/MembershipQuestion';
import Membership from '../membership/Membership';
import MembershipDataRepo from './MembershipData.repo';

@ObjectType()
@Entity({ customRepository: () => MembershipDataRepo })
export default class MembershipData extends BaseEntity {
  [EntityRepositoryType]?: MembershipDataRepo;

  // We keep this loosely defined as a string to give flexibility, especially
  // for multiple choice and multiple select values.
  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  value: string;

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne(() => Membership)
  membership: Membership;

  @Field(() => MembershipQuestion)
  @ManyToOne(() => MembershipQuestion)
  question: MembershipQuestion;
}
