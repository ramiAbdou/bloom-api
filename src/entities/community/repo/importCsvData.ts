import csv from 'csvtojson';
import day from 'dayjs';
import { internet } from 'faker';

import BloomManager from '@core/db/BloomManager';
import MemberPlan from '@entities/member-plan/MemberPlan';
import MemberSocials from '@entities/member-socials/MemberSocials';
import MemberValue from '@entities/member-value/MemberValue';
import Member, { MemberRole, MemberStatus } from '@entities/member/Member';
import Question, { QuestionCategory } from '@entities/question/Question';
import User from '@entities/user/User';
import { isProduction, TEST_EMAILS } from '@util/constants';
import { MutationEvent } from '@util/events';
import Community from '../Community';

type CsvRowData = Record<string | QuestionCategory, any>;

interface ProcessRowArgs {
  bm: BloomManager;
  community: Community;
  ownerEmail: string;
  questions: Question[];
  row: CsvRowData;
  plans: MemberPlan[];
  uniqueEmails: Set<string>;
}

interface ImportCsvDataArgs {
  urlName: string;
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
  plans,
  uniqueEmails
}: ProcessRowArgs) => {
  // Precondition: Every row (JSON) should have a field called EMAIL.
  const { EMAIL: dirtyEmail, FIRST_NAME: firstName, LAST_NAME: lastName } = row;

  const email =
    isProduction || TEST_EMAILS.includes(dirtyEmail)
      ? dirtyEmail?.toLowerCase()
      : internet.email();

  // If no email exists or it is a duplicate email, don't process.
  if (!email || uniqueEmails.has(email)) return;
  uniqueEmails.add(email);

  const [user, wasFound] = await bm.findOneOrCreate(User, { email }, { email });

  // If a member already exists for the user, then don't create a new
  // member. The possible case for this is for an OWNER of a community.
  // They will have already been created in a script and might also be
  // in a CSV.
  if (wasFound && (await bm.findOne(Member, { community, user }))) return;

  // // We persist the member instead of the user since the user can
  // // potentially be persisted already.
  const member: Member = bm.create(Member, {
    community,
    email,
    firstName,
    lastName,
    role: email === ownerEmail ? MemberRole.OWNER : null,
    status: MemberStatus.ACCEPTED,
    user
  });

  const socials: MemberSocials = bm.create(MemberSocials, { member });

  if (email === ownerEmail) community.owner = member;

  Object.entries(row).forEach(
    ([key, value]: [string | QuestionCategory, string]) => {
      // Skip over the empty values and the user-specific information since it
      // was already processed.
      if (!value) return;

      if (key === QuestionCategory.MEMBER_PLAN) {
        member.plan = plans.find(({ name }) => value === name);
        return;
      }

      if (key === QuestionCategory.LINKED_IN_URL) {
        socials.linkedInUrl = value;
        return;
      }

      if (key === QuestionCategory.JOINED_AT) {
        const dayObject = day.utc(value);

        // Safety check to ensure the date is formatted correctly.
        const createdAt = dayObject.isValid()
          ? dayObject.format()
          : day.utc().format();

        member.createdAt = createdAt;
        member.joinedAt = createdAt;
        return;
      }

      // If the question wasn't a special category question, then we find
      // the question with the given key as the title. We proceed to make
      // the appropriate member data.

      const question = questions.find(({ category, title }) => {
        return key === category || key === title;
      });

      if (question) bm.create(MemberValue, { member, question, value });
    }
  );
};

/**
 * This should only be called in the process of creating a community for the
 * first time, NOT updating the community. It first reads the CSV file
 * with the associated community name, then either creates Members with
 * NEW users if the email is not found in the DB based on the CSV row, or
 * adds a Member based on the current users in our DB.
 */
const importCsvData = async ({ urlName, ownerEmail }: ImportCsvDataArgs) => {
  const bm = new BloomManager();

  const [community, responses]: [
    Community,
    Record<string, any>[]
  ] = await Promise.all([
    bm.findOne(Community, { urlName }, { populate: ['questions', 'plans'] }),
    csv().fromFile(`./membership-csv/${urlName}.csv`)
  ]);

  const questions = community.questions.getItems();
  const plans = community.plans.getItems();

  // Adds protection against any emails that are duplicates in the CSV file,
  // INCLUDING case-insensitive duplicates.
  const uniqueEmails = new Set<string>();

  await Promise.all(
    responses.map(async (row: CsvRowData) => {
      await processRow({
        bm,
        community,
        ownerEmail,
        plans,
        questions,
        row,
        uniqueEmails
      });
    })
  );

  await bm.flush({ flushEvent: MutationEvent.IMPORT_COMMUNITY_CSV });
  return community;
};

export default importCsvData;
