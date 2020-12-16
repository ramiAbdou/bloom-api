import { ArgsType, Field, Int } from 'type-graphql';

import { Event, GQLContext } from '@constants';
import cache from '@core/cache';
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

  const { encodedUrlName } = question.community;

  if (version < question.version) {
    throw new Error(
      `Looks like somebody else just updated this question title. Please refresh and try again.`
    );
  }

  question.title = title;

  // COME BACK TO THIS!
  // await bm.flush('QUESTION_RENAMED', question, true);
  await bm.flush('QUESTION_RENAMED');

  // Invalidate GET_APPLICATION since we fetch the member questions
  // there as well.
  cache.invalidateEntries([
    `${Event.GET_APPLICATION}-${encodedUrlName}`,
    `${Event.GET_DIRECTORY}-${communityId}`,
    `${Event.GET_MEMBERS}-${communityId}`
  ]);

  return question;
};
