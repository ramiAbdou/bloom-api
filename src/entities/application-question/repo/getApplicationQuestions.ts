import { ArgsType, Field } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import ApplicationQuestion from '../ApplicationQuestion';

@ArgsType()
export class GetApplicationQuestionsArgs {
  @Field({ nullable: true })
  urlName?: string;
}

const getApplicationQuestions = async (
  args: GetApplicationQuestionsArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<ApplicationQuestion[]> => {
  const key = args.urlName ?? ctx.communityId;

  const applicationQuestions: ApplicationQuestion[] = await new BloomManager().find(
    ApplicationQuestion,
    {
      application: {
        community: args.urlName ? { urlName: args.urlName } : ctx.communityId
      }
    },
    {
      cacheKey: `${QueryEvent.GET_APPLICATION_QUESTIONS}-${key}`,
      orderBy: { createdAt: QueryOrder.ASC },
      populate: ['question']
    }
  );

  return applicationQuestions;
};

export default getApplicationQuestions;
