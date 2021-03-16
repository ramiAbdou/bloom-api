import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  AfterUpdate,
  ArrayType,
  BeforeCreate,
  Entity,
  Enum,
  ManyToOne,
  Property
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';

export enum QuestionCategory {
  BIO = 'BIO',
  CLUBHOUSE_URL = 'CLUBHOUSE_URL',
  DUES_STATUS = 'DUES_STATUS',
  EMAIL = 'EMAIL',
  EVENTS_ATTENDED = 'EVENTS_ATTENDED',
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
  static cache: Cache = new Cache();

  // ## FIELDS

  // If the question is a special question, we have to store it in a different
  // fashion. For example, EMAIL would be stored on the user, NOT the
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

  @Field({ nullable: true })
  @Property({ nullable: true })
  rank?: number;

  @Field()
  @Property()
  required: boolean = true;

  @Field()
  @Property()
  title: string;

  @Field(() => String, { nullable: true })
  @Enum({ items: () => QuestionType, nullable: true, type: String })
  type: QuestionType;

  // ## LIFECYCLE HOOKS

  @BeforeCreate()
  beforeCreate() {
    if (this.category === QuestionCategory.BIO) {
      if (!this.title) this.title = 'Bio';
      this.type = QuestionType.LONG_TEXT;
    }

    if (this.category === QuestionCategory.CLUBHOUSE_URL) {
      if (!this.title) this.title = 'Clubhouse URL';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.DUES_STATUS) {
      if (!this.title) this.title = 'Dues Status';
      this.locked = true;
      this.options = ['Paid', 'Not Paid'];
      this.type = QuestionType.MULTIPLE_CHOICE;
    }

    if (this.category === QuestionCategory.EMAIL) {
      if (!this.title) this.title = 'Email';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.EVENTS_ATTENDED) {
      if (!this.title) this.title = '# of Events Attended';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.FACEBOOK_URL) {
      if (!this.title) this.title = 'Facebook URL';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.FIRST_NAME) {
      if (!this.title) this.title = 'First Name';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.GENDER) {
      if (!this.title) this.title = 'Gender';
      this.options = ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'];
      this.type = QuestionType.MULTIPLE_CHOICE;
    }

    if (this.category === QuestionCategory.INSTAGRAM_URL) {
      if (!this.title) this.title = 'Instagram URL';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.JOINED_AT) {
      if (!this.title) this.title = 'Joined At';
      this.locked = true;
    }

    if (this.category === QuestionCategory.LAST_NAME) {
      if (!this.title) this.title = 'Last Name';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.LINKED_IN_URL) {
      if (!this.title) this.title = 'LinkedIn URL';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.MEMBER_PLAN) {
      if (!this.title) this.title = 'Member Plan';
      this.locked = true;
      this.type = QuestionType.MULTIPLE_CHOICE;
    }

    if (this.category === QuestionCategory.TWITTER_URL) {
      if (!this.title) this.title = 'Twitter URL';
      this.type = QuestionType.SHORT_TEXT;
    }
  }

  // ## LIFECYCLE HOOKS

  @AfterCreate()
  afterCreate() {
    Question.cache.invalidateKeys([
      `${QueryEvent.GET_QUESTIONS}-${this.community.id}`
    ]);
  }

  @AfterUpdate()
  afterUpdate() {
    Question.cache.invalidateKeys([
      `${QueryEvent.GET_QUESTIONS}-${this.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;
}
