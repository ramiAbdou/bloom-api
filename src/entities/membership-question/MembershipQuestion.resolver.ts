import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import MembershipQuestion from './MembershipQuestion';
import { RenameQuestionArgs } from './MembershipQuestion.args';

@Resolver()
export default class MembershipQuestionResolver {
  @Authorized('ADMIN')
  @Mutation(() => MembershipQuestion, { nullable: true })
  async renameQuestion(
    @Args() { id, title, version }: RenameQuestionArgs,
    @Ctx() { communityId }: GQLContext
  ): Promise<MembershipQuestion> {
    return new BloomManager()
      .membershipQuestionRepo()
      .renameQuestion(id, title, version, communityId);
  }
}
