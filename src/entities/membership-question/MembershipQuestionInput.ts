/**
 * @fileoverview Entity: MembershipQuestion
 * @author Rami Abdou
 */

import { Field, InputType, Int } from 'type-graphql';

import { QuestionCategory, QuestionType } from '@util/gql';
import MembershipQuestion from './MembershipQuestion';

@InputType()
export default class MembershipQuestionInput
  implements Partial<MembershipQuestion> {
  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // membership.
  @Field(() => String, { nullable: true })
  category: QuestionCategory;

  @Field({ nullable: true })
  description: string;

  // If set to false, this question will not appear in the community's
  // membership application form.
  @Field(() => Boolean)
  inApplication = true;

  // Order that the question appears. Similar to an index in an array.
  @Field(() => Int)
  order: number;

  @Field(() => Boolean)
  required = true;

  @Field()
  title: string;

  @Field(() => String)
  type: QuestionType;
}
