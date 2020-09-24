/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Args, Mutation, Resolver } from 'type-graphql';

import bloomManager from '@bloomManager';
import { CreateFormValue } from '@constants';
import { Community, Membership, User } from '@entities';
import CreateMembershipArgs from './CreateMembershipArgs';
import UpdateMembershipArgs from './UpdateMembershipArgs';

@Resolver()
export default class MembershipResolver {
  /**
   * Creates a Membership is for the given Community ID, and also creates a
   * User with the basic information from the membership data.
   */
  @Mutation(() => Boolean, { nullable: true })
  async createMembership(
    @Args() { communityId, data, email }: CreateMembershipArgs
  ) {
    const bm = bloomManager.fork();

    const community: Community = await bm
      .communityRepo()
      .findOne({ id: communityId });

    // The user can potentially already exist if they are a part of other
    // communities.
    const user: User = email
      ? await bm.userRepo().findOne({ email })
      : new User();

    const membership: Membership = new Membership();
    const membershipData: Record<string, any> = {};

    membership.community = community;
    membership.data = membershipData;
    membership.user = user;

    // We only use a Promise for the Membership Type case since we need to
    // fetch the type from the DB.
    await Promise.all(
      data.map(async ({ category, title, value }: CreateFormValue) => {
        if (category === 'FIRST_NAME') user.firstName = value;
        else if (category === 'LAST_NAME') user.lastName = value;
        else if (category === 'EMAIL') user.email = value;
        else if (category === 'GENDER') user.gender = value;
        else if (category === 'MEMBERSHIP_TYPE') {
          const type = await bm.membershipTypeRepo().findOne({ name: value });
          membership.type = type;
        } else membershipData[title] = value;
      })
    );

    bm.persist([membership, user]);
    await bm.flush(`Membership created for ${user.fullName}.`, { user });
  }

  /**
   * Updates the membership data that is specified, and leaves all other
   * membership data alone.
   */
  @Mutation(() => Boolean, { nullable: true })
  async updateMembershipData(
    @Args() { communityId, data, userId }: UpdateMembershipArgs
  ) {
    const bm = bloomManager.fork();

    const membership: Membership = await bm
      .membershipRepo()
      .findOne({ community: { id: communityId }, user: { id: userId } }, [
        'user'
      ]);

    data.forEach(({ title, value }: CreateFormValue) => {
      membership.data[title] = value;
    });

    const { user } = membership;
    await bm.flush(`Membership data updated for ${user.fullName}.`, { user });
  }
}
