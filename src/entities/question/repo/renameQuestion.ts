import { ArgsType, Field, Int } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Question from '../Question';

@ArgsType()
export class RenameQuestionArgs {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => Int)
  version: number;
}

export default async (
  { id, title, version }: RenameQuestionArgs,
  { communityId }: GQLContext
) => {
  const bm = new BloomManager();

  const question = await bm.findOne(
    Question,
    { id },
    { populate: ['community'] }
  );

  const { urlName } = question.community;

  if (version < question.version) {
    throw new Error(
      `Looks like somebody else just updated this question title. Please refresh and try again.`
    );
  }

  question.title = title;

  await bm.flush({
    cacheKeysToInvalidate: [
      `${QueryEvent.GET_APPLICATION}-${urlName}`,
      `${QueryEvent.GET_DATABASE}-${communityId}`,
      `${QueryEvent.GET_DIRECTORY}-${communityId}`
    ],
    event: 'QUESTION_RENAMED'
  });

  return question;
};
