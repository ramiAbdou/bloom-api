import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import { QueryEvent } from '@util/events';
import BloomManager from '@core/db/BloomManager';
import MemberType from '../MemberType';

@ArgsType()
export class GetTypesArgs {
  @Field({ nullable: true })
  urlName?: string;
}

const getTypes = async (
  { urlName }: GetTypesArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
): Promise<MemberType[]> => {
  const args: FilterQuery<MemberType> = urlName
    ? { community: { urlName } }
    : { community: { id: communityId } };

  const key = urlName ?? communityId;

  return new BloomManager().find(
    MemberType,
    { ...args },
    { cacheKey: `${QueryEvent.GET_TYPES}-${key}` }
  );
};

export default getTypes;
