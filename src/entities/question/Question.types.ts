import Question from './Question';

export type QuestionType =
  | 'LONG_TEXT'
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'SHORT_TEXT';

export type QuestionCategory =
  | 'CURRENT_LOCATION'
  | 'EMAIL'
  | 'FIRST_NAME'
  | 'GENDER'
  | 'JOINED_ON'
  | 'LAST_NAME'
  | 'MEMBERSHIP_TYPE';

export class QuestionInput implements Partial<Question> {
  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // member.
  category?: QuestionCategory;

  description?: string;

  // If set to false, this question will not appear in the community's
  // member application form.
  inApplication? = true;

  // If set to false, this question will not appear in the community's
  // member application form.
  inApplicantCard? = false;

  // If set to false, this question will not appear in the community's
  // member application form.
  inDirectoryCard? = false;

  // If set to false, this question will not appear in the community's
  // member application form.
  inExpandedDirectoryCard? = false;

  required? = true;

  // @ts-ignore b/c we want it to be an array, and type casting is weird when
  // implementing Partial<Question>.
  options?: string[];

  title: string;

  type?: QuestionType;
}
