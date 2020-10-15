/**
 * @fileoverview Utility: GraphQL Types
 * @author Rami Abdou
 */

/* eslint-disable max-classes-per-file */

export type QuestionType =
  | 'DROPDOWN_MULTIPLE'
  | 'LONG_TEXT'
  | 'MULTIPLE_CHOICE'
  | 'SHORT_TEXT';

export type QuestionCategory =
  | 'EMAIL'
  | 'FIRST_NAME'
  | 'GENDER'
  | 'LAST_NAME'
  | 'MEMBERSHIP_TYPE';
