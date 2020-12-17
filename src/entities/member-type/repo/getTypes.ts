import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import MemberType from '../MemberType';

export default async ({ communityId }: GQLContext): Promise<MemberType[]> => {
  return new BloomManager().find(MemberType, {
    community: { id: communityId }
  });
};
