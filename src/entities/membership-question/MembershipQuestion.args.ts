/**
 * @fileoverview Entity: MembershipQuestion
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { QuestionCategory, QuestionType } from '@util/gql';
import MembershipQuestion from './MembershipQuestion';

@ArgsType()
export class RenameQuestionArgs {
  @Field()
  id: string;

  @Field()
  title: string;
}

export class MembershipQuestionInput implements Partial<MembershipQuestion> {
  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // membership.
  category?: QuestionCategory;

  description?: string;

  // If set to false, this question will not appear in the community's
  // membership application form.
  inApplication? = true;

  // If set to false, this question will not appear in the community's
  // membership application form.
  inApplicantCard? = false;

  required? = true;

  // @ts-ignore b/c we want it to be an array, and type casting is weird when
  // implementing Partial<MembershipQuestion>.
  options?: string[];

  title: string;

  type?: QuestionType;
}
