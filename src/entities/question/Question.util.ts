import { EntityData } from '@mikro-orm/core';

import Question, { QuestionCategory, QuestionType } from './Question';

export const defaultQuestions: EntityData<Question>[] = [
  {
    category: QuestionCategory.FIRST_NAME,
    locked: true,
    title: 'First Name',
    type: QuestionType.SHORT_TEXT
  },
  {
    category: QuestionCategory.LAST_NAME,
    locked: true,
    title: 'Last Name',
    type: QuestionType.SHORT_TEXT
  },
  {
    category: QuestionCategory.BIO,
    locked: true,
    title: 'Bio',
    type: QuestionType.LONG_TEXT
  },
  {
    category: QuestionCategory.DUES_STATUS,
    locked: true,
    options: ['Paid', 'Not Paid'],
    title: 'Dues Status',
    type: QuestionType.MULTIPLE_CHOICE
  },
  {
    category: QuestionCategory.MEMBER_PLAN,
    locked: true,
    title: 'Membership Type',
    type: QuestionType.MULTIPLE_CHOICE
  },
  { category: QuestionCategory.JOINED_AT, locked: true, title: 'Joined At' }
];
