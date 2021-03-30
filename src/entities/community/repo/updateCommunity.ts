import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { cleanObject } from '@util/util';

interface UpdateCommunityArgs {
  communityId: string;
  highlightedQuestion: string;
}

/**
 * Returns the updated Community.
 *
 * @param args.communityId - ID of the Community to update.
 * @param args.highlightedQuestionId - ID of Question to highlight.
 */
const updateCommunity = async (
  args: UpdateCommunityArgs
): Promise<Community> => {
  const { communityId, ...communityData } = args;

  const community: Community = await new BloomManager().findOneAndUpdate(
    Community,
    { id: communityId },
    cleanObject(communityData)
  );

  return community;
};

export default updateCommunity;
