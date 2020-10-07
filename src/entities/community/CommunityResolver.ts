/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import csv from 'csvtojson';
import { Args, Mutation, Query, Resolver } from 'type-graphql';

import { FormQuestionCategory } from '@constants';
import { Community, Membership, User } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import {
  CommunityPopulation,
  CreateCommunityArgs,
  GetCommunityArgs
} from './CommunityArgs';

@Resolver()
export default class CommunityResolver {
  /**
   * Creates a new community when Bloom has a new customer. Omits the addition
   * of a logo. For now, the community should send Bloom a square logo that
   * we will manually add to the Digital Ocean space.
   */
  @Mutation(() => Community, { nullable: true })
  async createCommunity(
    @Args()
    { autoAccept, hasCSV, name, membershipForm }: CreateCommunityArgs
  ) {
    const bm = new BloomManager();
    const community = bm
      .communityRepo()
      .create({ autoAccept, membershipForm, name });
    bm.persist(community);

    // If the community has a CSV file of existing members, then we run this
    // script that reads all of the data and creates users/memberships in our
    // DB based on that data.
    if (hasCSV) {
      const responses = await csv().fromFile(`./membership-csv/${name}.csv`);

      await Promise.all(
        responses.map(async (row: Record<string, any>) => {
          // Precondition: Every row (JSON) should have a field called 'EMAIL'.
          const email = row[FormQuestionCategory.EMAIL];

          // If the user already exists, fetch it from the DB and if not, create
          // a new user for the membership.
          const user: User =
            (await bm.userRepo().findOne({ email })) ?? new User();

          // We persist the membership instead of the user since the user can
          // potentially be persisted already.
          const membership: Membership = new Membership();
          const membershipData: Record<string, any> = {};
          bm.persist(membership);

          membership.community = community;
          membership.data = membershipData;
          membership.user = user;

          // The row is a JSON that maps keys to values.
          Object.entries(row).map(async ([key, value]) => {
            if (key === FormQuestionCategory.FIRST_NAME) user.firstName = value;
            else if (key === FormQuestionCategory.LAST_NAME)
              user.lastName = value;
            else if (key === FormQuestionCategory.EMAIL) user.email = value;
            else if (key === FormQuestionCategory.GENDER) user.gender = value;
            else membershipData[key] = value;
          });
        })
      );
    }

    await bm.flush(`${name} has been created!`, { community });
    return community;
  }

  /**
   * Fetches a community either by the ID or by the encodedURLName. The only
   * time the encodedURLName will be used is when the membershipForm is needed
   * in the GraphQL request.
   */
  @Query(() => Community)
  async getCommunity(
    @Args() { encodedURLName, id, population }: GetCommunityArgs
  ) {
    const bm = new BloomManager();

    const populate =
      population === CommunityPopulation.GET_MEMBERSHIPS
        ? ['memberships.type', 'memberships.user']
        : [];

    const queryBy = id ? { id } : { encodedURLName };
    return bm.communityRepo().findOne({ ...queryBy }, { populate });
  }
}
