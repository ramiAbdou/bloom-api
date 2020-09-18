/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Args, Mutation, Resolver } from 'type-graphql';

import bloomManager from '@bloomManager';
import { CreateFormValue } from '@constants';
import { Community, Membership, User } from '@entities';
import CreateMembershipArgs from './CreateMembershipArgs';

@Resolver()
export default class MembershipResolver {
  @Mutation(() => Boolean, { nullable: true })
  async createMembership(@Args() { communityId, data }: CreateMembershipArgs) {
    const bm = bloomManager.fork();

    const community: Community = await bm
      .communityRepo()
      .findOne({ id: communityId });

    const user: User = new User();

    const membershipData: Record<string, any> = {};
    const membership: Membership = new Membership();

    membership.community = community;
    membership.data = membershipData;
    membership.user = user;

    await Promise.all(
      data.map(async ({ category, title, value }: CreateFormValue) => {
        if (!category) membershipData[title] = value;
        else if (category === 'FIRST_NAME') user.firstName = value;
        else if (category === 'LAST_NAME') user.lastName = value;
        else if (category === 'EMAIL') user.email = value;
        else if (category === 'GENDER') user.gender = value;
        else {
          membership.type = await bm
            .membershipTypeRepo()
            .findOne({ name: value });
        }
      })
    );

    bm.persist([membership, user]);
    await bm.flush(`Membership created for ${user.fullName}.`, { user });
  }
}
