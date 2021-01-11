import csv from 'csvtojson';
import day from 'dayjs';

import { BloomManagerArgs } from '@constants';
import BloomManager from '@core/db/BloomManager';
import MemberData from '../../member-data/MemberData';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import { MemberRole } from '../../member/Member.types';
import Question from '../../question/Question';
import { QuestionCategory } from '../../question/Question.types';
import User from '../../user/User';
import Community from '../Community';

type CsvRowData = Record<string | QuestionCategory, any>;

interface ProcessRowArgs extends BloomManagerArgs {
  community: Community;
  ownerEmail: string;
  questions: Question[];
  row: CsvRowData;
  types: MemberType[];
  uniqueEmails: Set<string>;
}

interface ImportCsvDataArgs {
  encodedUrlName: string;
  ownerEmail: string;
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
    EMAIL: dirtyEmail,
    FIRST_NAME: firstName,
    LAST_NAME: lastName,
    GENDER: gender
  } = row;

  const email = dirtyEmail?.toLowerCase();

  // If no email exists or it is a duplicate email, don't process.
  if (!email || uniqueEmails.has(email)) return;
  uniqueEmails.add(email);

  const [user, wasFound] = await bm.findOneOrCreate(
    User,
    { email },
    { email, firstName, gender, lastName },
    { cache: false }
  );

  // If a member already exists for the user, then don't create a new
  // member. The possible case for this is for an OWNER of a community.
  // They will have already been created in a script and might also be
  // in a CSV.
  if (wasFound && (await bm.findOne(Member, { community, user }))) return;

  // // We persist the member instead of the user since the user can
  // // potentially be persisted already.
  const member: Member = bm.create(Member, {
    community,
    role: email === ownerEmail ? MemberRole.OWNER : null,
    status: 'ACCEPTED',
    user
  });

  Object.entries(row).forEach(([key, value]) => {
    // Skip over the empty values and the user-specific information since it
    // was already processed.
    if (!value) return;

    if (key === QuestionCategory.MEMBERSHIP_TYPE) {
      const type = types.find(({ name }) => value === name);
      if (type) member.type = type;
    } else if (key === QuestionCategory.JOINED_AT) {
      const dayObject = day.utc(value);

      // Safety check to ensure the date is formatted correctly.
      const createdAt = dayObject.isValid()
        ? dayObject.format()
        : day.utc().format();

      member.createdAt = createdAt;
      member.joinedAt = createdAt;
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
const importCsvData = async ({
  encodedUrlName,
  ownerEmail
}: ImportCsvDataArgs) => {
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
    responses.map(async (row: CsvRowData) => {
      await processRow({
        bm,
        community,
        ownerEmail,
        questions,
        row,
        types,
        uniqueEmails
      });
    })
  );

  await bm.flush('COMMUNITY_CSV_IMPORTED');
  return community;
};

export default importCsvData;