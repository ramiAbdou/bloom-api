import { Field, ObjectType } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';

@ObjectType()
export class GetDuesInformationResult {
  @Field({ nullable: true })
  stripeAccountId: string;

  @Field(() => [MemberType])
  types: MemberType[];
}

export default async function getDuesInformation({
  communityId
}: GQLContext): Promise<GetDuesInformationResult> {
  const { integrations, types }: Community = await new BloomManager().findOne(
    Community,
    { id: communityId },
    { populate: ['integrations', 'types'] }
  );

  return {
    stripeAccountId: integrations.stripeAccountId,
    types: types.getItems()
  };
}
