import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from '../../community/Community';
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
  const { urlName }: Community = await new BloomManager().findOne(Community, {
    id: communityId
  });

  return new BloomManager().findOneAndUpdate(
    Question,
    { id },
    { title },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_APPLICATION}-${urlName}`,
        `${QueryEvent.GET_DATABASE}-${communityId}`,
        `${QueryEvent.GET_DIRECTORY}-${communityId}`
      ],
      event: 'RENAME_QUESTION',
      populate: ['community']
    }
  );
};

export default renameQuestion;
