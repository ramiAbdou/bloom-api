import csv from 'csvtojson';
import day from 'dayjs';
import { wrap } from '@mikro-orm/core';

import { BloomManagerArgs } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Member, User } from '@entities/entities';
import MemberData from '../../member-data/MemberData';
import MemberType from '../../member-type/MemberType';
import { MemberRole } from '../../member/Member.types';
import Question from '../../question/Question';
import { QuestionCategory } from '../../question/Question.types';
import Community from '../Community';

type CsvRowData = Record<string | QuestionCategory, any>;
type ImportCsvDataArgs = { encodedUrlName: string; ownerEmail: string };
interface ProcessRowArgs extends BloomManagerArgs {
  community: Community;
  ownerEmail: string;
  questions: Question[];
  row: CsvRowData;
  types: MemberType[];
  uniqueEmails: Set<string>;
}

/**
 * Processes 1 row's data in the Member CSV file. Responsible creating and/or
 * fetching the User and creating the corresponding Member entity for the
 * Community.
 *
 * Stores basic information on the User/Member entity, and everything else is
 * stored as MemberData.
 */
const processRow = async ({
  bm,
  community,
  questions,
  ownerEmail,
  row,
  types,
  uniqueEmails
}: ProcessRowArgs) => {
  // Precondition: Every row (JSON) should have a field called 'EMAIL'.
  const {
    EMAIL: email,
    FIRST_NAME: firstName,
    GENDER: gender,
    LAST_NAME: lastName
  } = row;

  // If no email exists or it is a duplicate email, don't process.
  if (!email || uniqueEmails.has(email.toLowerCase())) return;
  uniqueEmails.add(email.toLowerCase());

  // If the user already exists, fetch it from the DB and if not, create
  // a new user for the member.
  const user: User = await bm.findOneOrCreate(User, {
    email,
    firstName,
    gender,
    lastName
  });

  // If a member already exists for the user, then don't create a new
  // member. The possible case for this is for an OWNER of a community.
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

  if (email === ownerEmail) wrap(member).assign({ role: MemberRole.OWNER });

  // eslint-disable-next-line array-callback-return
  Object.entries(row).map(([key, value]) => {
    // Skip over the empty values and the user-specific information since it
    // was already processed.
    if (
      !value ||
      [
        QuestionCategory.EMAIL,
        QuestionCategory.FIRST_NAME,
        QuestionCategory.LAST_NAME,
        QuestionCategory.GENDER
      ].includes(key as QuestionCategory)
    ) {
      return;
    }

    // If no member type exists in the array, then the default
    // member will be set as the member type.
    if (key === 'MEMBERSHIP_TYPE') {
      const type = types.find(({ name }) => value === name);
      if (type) wrap(member).assign({ type });
    }

    // IMPORTANT: The value must be a valid input to the Date constructor
    // or else errors will be thrown!
    else if (key === 'JOINED_ON') {
      const dayObject = day.utc(value);

      // Safety check to ensure the date is formatted correctly.
      const createdAt = dayObject.isValid()
        ? dayObject.format()
        : day.utc().format();

      wrap(member).assign({ createdAt, joinedAt: createdAt });
      wrap(user).assign({ createdAt });
    }

    // If the question wasn't a special category question, then we find
    // the question with the given key as the title. We proceed to make
    // the appropriate member data.
    else {
      const question = questions.find(({ title }) => key === title);
      if (question) {
        bm.create(MemberData, { member, question, value });
      }
    }
  });
};

/**
 * This should only be called in the process of creating a community for the
 * first time, NOT updating the community. It first reads the CSV file
 * with the associated community name, then either creates Members with
 * NEW users if the email is not found in the DB based on the CSV row, or
 * adds a Member based on the current users in our DB.
 */
export default async ({ encodedUrlName, ownerEmail }: ImportCsvDataArgs) => {
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
    responses.map(async (row: CsvRowData) =>
      processRow({
        bm,
        community,
        ownerEmail,
        questions,
        row,
        types,
        uniqueEmails
      })
    )
  );

  await bm.flush('COMMUNITY_CSV_IMPORTED');
  return community;
};
