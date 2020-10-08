/**
 * @fileoverview Entity: Community
 * @author Rami Abdou
 */

import { IsUrl } from 'class-validator';
import {
  BeforeCreate,
  Collection,
  Entity,
  JsonType,
  OneToMany,
  Property
} from 'mikro-orm';
import { Field, ObjectType } from 'type-graphql';

import { Form, FormQuestionCategory } from '@constants';
import BaseEntity from '@util/db/BaseEntity';
import { toLowerCaseDash } from '@util/util';
import Membership from '../membership/Membership';

@ObjectType()
@Entity()
export default class Community extends BaseEntity {
  // True if the membership should be accepted automatically.
  @Property({ type: Boolean })
  autoAccept = false;

  // The URL encoded version of the community name: ColorStack => colorstack.
  // We have to persist this in the DB because we have use cases in which we
  // need to query the DB by the encodedURLName, which we wouldn't be able to
  // do if it wasn't persisted.
  @Field()
  @Property({ unique: true })
  encodedURLName: string;

  // URL to the Digital Ocean space.
  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
  @IsUrl()
  logo: string;

  @Property({ nullable: true, unique: true })
  mailchimpAccessToken: string;

  // Maps the title to the item. Represented as JSON. This doesn't automatically
  // include the First Name, Last Name, Email, and Membership Types, so when
  // creating the membership form, those need to be specified.
  @Field(() => Form)
  @Property({ type: JsonType })
  membershipForm: Form;

  @Field()
  @Property({ unique: true })
  name: string;

  @Property({ nullable: true, unique: true })
  zoomAccessToken: string;

  @Property({ nullable: true, unique: true })
  zoomRefreshToken: string;

  @Field(() => Form)
  @Property({ persist: false, type: JsonType })
  get basicMembershipForm(): Form {
    const { questions, ...form } = this.membershipForm;
    return {
      ...form,
      questions: questions.filter(
        ({ category }) =>
          ![
            FormQuestionCategory.FIRST_NAME,
            FormQuestionCategory.LAST_NAME,
            FormQuestionCategory.EMAIL,
            FormQuestionCategory.GENDER
          ].includes(category)
      )
    };
  }

  @BeforeCreate()
  beforeCreate() {
    this.encodedURLName = toLowerCaseDash(this.name);
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
}
