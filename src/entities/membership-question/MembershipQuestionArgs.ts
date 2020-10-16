/**
 * @fileoverview Entity: MembershipQuestion
 * @author Rami Abdou
 */

import { Field, InputType } from 'type-graphql';

import { QuestionCategory, QuestionType } from '@util/gql';
import MembershipQuestion from './MembershipQuestion';

@InputType()
export class MembershipQuestionInput implements Partial<MembershipQuestion> {
  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // membership.
  @Field(() => String, { nullable: true })
  category?: QuestionCategory;

  @Field({ nullable: true })
  description?: string;

  // If set to false, this question will not appear in the community's
  // membership application form.
  @Field(() => Boolean)
  inApplication? = true;

  @Field(() => Boolean)
  required? = true;

  @Field(() => [String], { nullable: true })
  // @ts-ignore b/c we want it to be an array, and type casting is weird when
  // implementing Partial<MembershipQuestion>.
  options?: string[];

  @Field()
  title: string;

  @Field(() => String)
  type: QuestionType;
}
