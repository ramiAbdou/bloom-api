/**
 * @fileoverview Utility: processMembershipCSV
 * - Script that is run when a new Community is being onboarded and needs to
 * upload new Users and Memberships.
 * @author Rami Abdou
 */

import csv from 'csvtojson';

import bloomManager from '@bloomManager';
import { Membership, User } from '@entities';
import { FormQuestionCategory } from './constants';

/**
 * Precondition: A CSV file has to exist for the community in the
 * /membership-csv/ folder to process.
 *
 * @param name Name of the community we are processing membership for.
 */
export default async (name: string) => {
  const bm = bloomManager.fork();
  const community = await bm.communityRepo().findOne({ name });

  const responses = await csv().fromFile(`./membership-csv/${name}.csv`);

  await Promise.all(
    responses.map(async (row: Record<string, any>) => {
      const email = row[FormQuestionCategory.EMAIL];

      const user: User = (await bm.userRepo().findOne({ email })) ?? new User();

      const membership: Membership = new Membership();
      const membershipData: Record<string, any> = {};
      bm.persist(membership);

      membership.community = community;
      membership.data = membershipData;
      membership.user = user;

      await Promise.all(
        Object.entries(row).map(async ([key, value]) => {
          if (key === FormQuestionCategory.FIRST_NAME) user.firstName = value;
          else if (key === FormQuestionCategory.LAST_NAME)
            user.lastName = value;
          else if (key === FormQuestionCategory.EMAIL) user.email = value;
          else if (key === FormQuestionCategory.GENDER) user.gender = value;
          else if (key === FormQuestionCategory.MEMBERSHIP_TYPE) {
            const type = await bm
              .membershipTypeRepo()
              .findOne({ community, name: value });
            membership.type = type;
          } else membershipData[key] = value;
        })
      );
    })
  );

  await bm.flush(`Finished processing Membership CSV file: ${name}.`);
};
