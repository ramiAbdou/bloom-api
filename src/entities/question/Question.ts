import { Field, ObjectType } from 'type-graphql';
import {
  AfterUpdate,
  ArrayType,
  BeforeCreate,
  Entity,
  Enum,
  ManyToOne,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/events';

export enum QuestionCategory {
  BIO = 'BIO',
  CLUBHOUSE_URL = 'CLUBHOUSE_URL',
  DUES_STATUS = 'DUES_STATUS',
  EMAIL = 'EMAIL',
  FACEBOOK_URL = 'FACEBOOK_URL',
  FIRST_NAME = 'FIRST_NAME',
  GENDER = 'GENDER',
  INSTAGRAM_URL = 'INSTAGRAM_URL',
  JOINED_AT = 'JOINED_AT',
  LAST_NAME = 'LAST_NAME',
  LINKED_IN_URL = 'LINKED_IN_URL',
  MEMBER_PLAN = 'MEMBER_PLAN',
  TWITTER_URL = 'TWITTER_URL'
}

export enum QuestionType {
  LONG_TEXT = 'LONG_TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  SHORT_TEXT = 'SHORT_TEXT'
}

@ObjectType()
@Entity()
export default class Question extends BaseEntity {
  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // member.
  @Field(() => String, { nullable: true })
  @Enum({ items: () => QuestionCategory, nullable: true, type: String })
  category?: QuestionCategory;

  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  description?: string;

  @Field({ defaultValue: false })
  @Property()
  locked: boolean = false;

  // Will only be non-null if the type is MULTIPLE_CHOICE or MULTIPLE_SELECT.
  @Field(() => [String], { nullable: true })
  @Property({ nullable: true, type: ArrayType })
  options?: string[];

  @Field()
  @Property()
  required: boolean = true;

  @Field()
  @Property()
  title: string;

  @Field(() => String, { nullable: true })
  @Enum({ items: () => QuestionType, nullable: true, type: String })
  type: QuestionType;

  // ## LIFECYCLE

  @BeforeCreate()
  beforeCreate() {
    if (
      [
        QuestionCategory.EMAIL,
        QuestionCategory.FIRST_NAME,
        QuestionCategory.LAST_NAME
      ].includes(this.category)
    ) {
      this.type = QuestionType.SHORT_TEXT;
    }

    if (
      [
        QuestionCategory.DUES_STATUS,
        QuestionCategory.JOINED_AT,
        QuestionCategory.MEMBER_PLAN
      ].includes(this.category)
    ) {
      this.locked = true;
    }

    if (
      [
        QuestionCategory.DUES_STATUS,
        QuestionCategory.GENDER,
        QuestionCategory.MEMBER_PLAN
      ].includes(this.category)
    ) {
      this.type = QuestionType.MULTIPLE_CHOICE;
    }

    if (this.category === QuestionCategory.GENDER) {
      this.options = ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'];
    }

    if (this.category === QuestionCategory.DUES_STATUS) {
      this.options = ['Paid', 'Not Paid'];
    }

    if (this.category === QuestionCategory.MEMBER_PLAN) {
      this.options = this.community.plans.getItems().map(({ name }) => name);
    }
  }

  @AfterUpdate()
  afterUpdate() {
    cache.invalidateKeys([`${QueryEvent.GET_QUESTIONS}-${this.community.id}`]);
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;
}
