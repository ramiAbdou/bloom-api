import csv from 'csvtojson';
import day from 'dayjs';

import BloomManager from '@core/db/BloomManager';
import { Member, User } from '@entities/entities';
import MemberData from '../../member-data/MemberData';
import Community from '../Community';

/**
 * This should only be called in the process of creating a community for the
 * first time, NOT updating the community. It first reads the CSV file
 * with the associated community name, then either creates Members with
 * NEW users if the email is not found in the DB based on the CSV row, or
 * adds a Member based on the current users in our DB.
 */
export default async (encodedUrlName: string) => {
  const bm = new BloomManager();

  const [community, responses]: [
    Community,
    Record<string, any>[]
  ] = await Promise.all([
    bm.findOne(
      Community,
      { encodedUrlName },
      { populate: ['questions', 'types'] }
    ),
    csv().fromFile(`./membership-csv/${encodedUrlName}.csv`)
  ]);

  const questions = community.questions.getItems();
  const types = community.types.getItems();

  // Adds protection against any emails that are duplicates in the CSV file,
  // INCLUDING case-insensitive duplicates.
  const uniqueEmails = new Set<string>();

  await Promise.all(
    responses.map(async (row: Record<string, any>) => {
      // Precondition: Every row (JSON) should have a field called 'EMAIL'.
      const email = row.EMAIL;
      const firstName = row.FIRST_NAME;
      const gender = row.GENDER;
      const lastName = row.LAST_NAME;

      // If no email exists OR
      if (!email || uniqueEmails.has(email.toLowerCase())) return;
      uniqueEmails.add(email.toLowerCase());

      // If the user already exists, fetch it from the DB and if not, create
      // a new user for the member.
      const user: User =
        (await bm.findOne(User, { email })) ??
        bm.create(User, { email, firstName, gender, lastName });

      // If a member already exists for the user, then don't create a new
      // member. The likely case for this is for an OWNER of a community.
      // They will have already been created in a script and might also be
      // in a CSV.
      if (await bm.findOne(Member, { community, user })) return;

      // We persist the member instead of the user since the user can
      // potentially be persisted already.
      const member: Member = bm.create(Member, {
        community,
        status: 'ACCEPTED',
        user
      });

      // eslint-disable-next-line array-callback-return
      Object.entries(row).map(([key, value]) => {
        // We already stored all of the user-specific information earlier.
        if (
          !value ||
          ['EMAIL', 'FIRST_NAME', 'LAST_NAME', 'GENDER'].includes(key)
        ) {
          return;
        }

        // If no member type exists in the array, then the default
        // member will be set as the member type.
        if (key === 'MEMBERSHIP_TYPE') {
          const type = types.find(({ name }) => value === name);
          if (type) member.type = type;
        }

        // IMPORTANT: The value must be a valid input to the Date constructor
        // or else errors will be thrown!
        else if (key === 'JOINED_ON') {
          let dayObject = day.utc(value);
          if (!dayObject.isValid()) dayObject = day.utc();

          member.createdAt = dayObject.format();
          user.createdAt = dayObject.format();
          member.joinedOn = dayObject.format();
        }

        // If the question wasn't a special category question, then we find
        // the question with the given key as the title. We proceed to make
        // the appropriate member data.
        else {
          const [question] = questions.filter(({ title }) => key === title);
          if (!question) return;
          bm.create(MemberData, { member, question, value });
        }
      });
    })
  );

  await bm.flush('COMMUNITY_CSV_IMPORTED');
  return community;
};
