import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Question from '../Question';

@ArgsType()
export class RenameQuestionArgs {
  @Field()
  id: string;

  @Field()
  title: string;
}

const renameQuestion = async (
  { id, title }: RenameQuestionArgs,
  { communityId }: GQLContext
) => {
  return new BloomManager().findOneAndUpdate(
    Question,
    { id },
    { title },
    {
      cacheKeysToInvalidate: [`${QueryEvent.GET_QUESTIONS}-${communityId}`],
      event: 'RENAME_QUESTION',
      populate: ['community']
    }
  );
};

export default renameQuestion;
