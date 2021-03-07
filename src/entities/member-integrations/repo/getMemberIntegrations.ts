import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import MemberIntegrations from '../MemberIntegrations';

/**
 * Returns the MemberIntegrations(s).
 *
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const getMemberIntegrations = async (
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberIntegrations[]> => {
  const { memberId } = ctx;

  const memberIntegrations: MemberIntegrations[] = await new BloomManager().find(
    MemberIntegrations,
    { member: memberId },
    { cacheKey: `${QueryEvent.GET_MEMBER_INTEGRATIONS}-${memberId}` }
  );

  return memberIntegrations;
};

export default getMemberIntegrations;
