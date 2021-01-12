import { Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import getActiveAnalytics, {
  GetActiveMemberAnalyticsResult
} from './repo/getActiveAnalytics';

@Resolver()
export default class MemberRefreshResolver {
  @Authorized('ADMIN')
  @Query(() => GetActiveMemberAnalyticsResult, { nullable: true })
  async getActiveMemberAnalytics(@Ctx() ctx: GQLContext) {
    return getActiveAnalytics(ctx);
  }
}
