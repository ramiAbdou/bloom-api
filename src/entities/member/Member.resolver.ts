import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Member } from '@entities';
import {
  ApplyForMemberArgs,
  CreateMembersArgs,
  DataSeries,
  DeleteMembersArgs,
  RespondToMembersArgs,
  ToggleAdminArgs
} from './Member.args';

@Resolver()
export default class MemberResolver {
  /**
   * Creates a Member is for the given Community ID, and also creates a
   * User with the basic information from the member data.
   */
  @Mutation(() => Member, { nullable: true })
  async applyForMember(
    @Args() { data, email, encodedUrlName }: ApplyForMemberArgs
  ): Promise<Member> {
    return new BloomManager()
      .memberRepo()
      .applyForMember(encodedUrlName, email, data);
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async respondToMembers(
    @Args() { memberIds, response }: RespondToMembersArgs,
    @Ctx() { communityId }: GQLContext
  ) {
    return !!(await new BloomManager()
      .memberRepo()
      .respondToMembers(memberIds, response, communityId));
  }

  @Authorized('OWNER')
  @Mutation(() => [Member], { nullable: true })
  async toggleAdmins(
    @Args() { memberIds }: ToggleAdminArgs,
    @Ctx() { communityId }: GQLContext
  ) {
    return new BloomManager().memberRepo().toggleAdmins(memberIds, communityId);
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async deleteMembers(
    @Args() { memberIds }: DeleteMembersArgs,
    @Ctx() { communityId }: GQLContext
  ) {
    return !!(await new BloomManager()
      .memberRepo()
      .deleteMembers(memberIds, communityId));
  }

  @Authorized('ADMIN')
  @Mutation(() => [Member], { nullable: true })
  async createMembers(
    @Args() { members }: CreateMembersArgs,
    @Ctx() { communityId }: GQLContext
  ) {
    return new BloomManager().memberRepo().createMembers(members, communityId);
  }

  @Authorized('ADMIN')
  @Query(() => [DataSeries], { nullable: true })
  async getTimeSeries(@Ctx() { communityId }: GQLContext) {
    return new BloomManager().memberRepo().getTimeSeries(communityId);
  }
}
