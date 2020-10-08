/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Args, Mutation, Resolver } from 'type-graphql';

import { FormQuestionCategory, FormValueInput } from '@constants';
import { Community, Membership, User } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import {
  CreateMembershipArgs,
  MembershipResponseArgs,
  UpdateMembershipArgs
} from './MembershipArgs';

@Resolver()
export default class MembershipResolver {
  /**
   * Creates a Membership is for the given Community ID, and also creates a
   * User with the basic information from the membership data.
   */
  @Mutation(() => Membership, { nullable: true })
  async createMembership(
    @Args() { communityId, data, userId }: CreateMembershipArgs
  ) {
    const bm = new BloomManager();
    const community: Community = await bm
      .communityRepo()
      .findOne({ id: communityId });

    // The user can potentially already exist if they are a part of other
    // communities.
    const user: User = userId
      ? await bm.userRepo().findOne({ id: userId })
      : new User();

    const membership: Membership = new Membership();
    const membershipData: Record<string, any> = {};

    membership.community = community;
    membership.data = membershipData;
    membership.user = user;

    // We only use a Promise for the Membership Type case since we need to
    // fetch the type from the DB.
    await Promise.all(
      data.map(async ({ category, title, value }: FormValueInput) => {
        if (category === FormQuestionCategory.FIRST_NAME)
          user.firstName = value;
        else if (category === FormQuestionCategory.LAST_NAME)
          user.lastName = value;
        else if (category === FormQuestionCategory.EMAIL) user.email = value;
        else if (category === FormQuestionCategory.GENDER) user.gender = value;
        else membershipData[title] = value;
      })
    );

    await bm.persistAndFlush(
      membership,
      `Membership created for ${user.fullName}.`,
      { user }
    );

    return membership;
  }

  /**
   * Updates the membership data that is specified, and leaves all other
   * membership data alone.
   */
  @Mutation(() => Membership)
  async updateMembershipData(
    @Args() { data, membershipId }: UpdateMembershipArgs
  ) {
    const bm = new BloomManager();
    const membership: Membership = await bm
      .membershipRepo()
      .findOne({ id: membershipId }, ['community', 'type', 'user']);

    data.forEach(({ title, value }: FormValueInput) => {
      membership.data[title] = value;
    });

    const { user } = membership;
    await bm.flush(`Membership data updated for ${user.fullName}.`, { user });

    return membership;
  }

  /**
   * An admin has the option to either accept or reject a Membership when they
   * apply to the organization.
   */
  @Mutation(() => Membership)
  async respondToMembership(
    @Args() { adminId, membershipId, response }: MembershipResponseArgs
  ) {
    const bm = new BloomManager();

    const [membership, admin]: [Membership, User] = await Promise.all([
      bm.membershipRepo().findOne({ id: membershipId }, ['user']),
      bm.userRepo().findOne({ id: adminId })
    ]);

    membership.status = response;

    await bm.flush(
      `${admin.fullName} responded to ${membership.user.fullName}'s membership
      application.`,
      { admin, membership }
    );

    return membership;
  }
}
