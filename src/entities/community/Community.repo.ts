/**
 * @fileoverview Repository: Community
 * @author Rami Abdou
 */

import csv from 'csvtojson';
import moment from 'moment';

import { Membership, MembershipQuestion, User } from '@entities';
import { getTokenFromCode } from '@integrations/mailchimp/Mailchimp.util';
import {
  getTokensFromCode,
  refreshAccessToken
} from '@integrations/zoom/Zoom.util';
import BaseRepo from '@util/db/BaseRepo';
import { MembershipTypeInput } from '../membership-type/MembershipType.args';
import Community from './Community';
import {
  CreateCommunityArgs,
  ImportCommunityCSVArgs,
  ReorderQuestionArgs
} from './Community.args';

export default class CommunityRepo extends BaseRepo<Community> {
  /**
   * Creates a new community when Bloom has a new customer. Omits the addition
   * of a logo. For now, the community should send Bloom a square logo that
   * we will manually add to the Digital Ocean space.
   */
  createCommunity = async ({
    applicationDescription: description,
    applicationTitle: title,
    questions,
    owner,
    types,
    ...data
  }: CreateCommunityArgs): Promise<Community> => {
    const bm = this.bm();

    const community: Community = this.createAndPersist({
      ...data,
      application: title
        ? bm.communityApplicationRepo().create({ description, title })
        : null,
      integrations: bm.communityIntegrationsRepo().create({}),
      memberships: [
        bm.membershipRepo().create({
          role: 'OWNER',
          user: bm.userRepo().create({ ...owner })
        })
      ],
      questions: questions.map((question, i: number) =>
        bm.membershipQuestionRepo().create({ ...question, order: i })
      ),
      types: types.map((type: MembershipTypeInput) =>
        bm.membershipTypeRepo().create(type)
      )
    });

    await this.flush('COMMUNITY_CREATED', community);
    return community;
  };

  /**
   * This should only be called in the process of creating a community for the
   * first time, NOT updating the community. It first reads the CSV file
   * with the associated community name, then either creates Memberships with
   * NEW users if the email is not found in the DB based on the CSV row, or
   * adds a Membership based on the current users in our DB.
   */
  importCSVDataToCommunity = async ({
    encodedUrlName
  }: ImportCommunityCSVArgs) => {
    const [community, responses]: [
      Community,
      Record<string, any>[]
    ] = await Promise.all([
      this.findOne({ encodedUrlName }, ['questions', 'types']),
      csv().fromFile(`./membership-csv/${encodedUrlName}.csv`)
    ]);

    const bm = this.bm();
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
        // a new user for the membership.
        const user: User =
          (await bm.userRepo().findOne({ email })) ??
          bm
            .userRepo()
            .createAndPersist({ email, firstName, gender, lastName });

        // If a membership already exists for the user, then don't create a new
        // membership. The likely case for this is for an OWNER of a community.
        // They will have already been created in a script and might also be
        // in a CSV.
        if (await bm.membershipRepo().findOne({ community, user })) return;

        // We persist the membership instead of the user since the user can
        // potentially be persisted already.
        const membership: Membership = bm
          .membershipRepo()
          .createAndPersist({ community, status: 'ACCEPTED', user });

        // eslint-disable-next-line array-callback-return
        Object.entries(row).map(([key, value]) => {
          // We already stored all of the user-specific information earlier.
          if (
            !value ||
            ['EMAIL', 'FIRST_NAME', 'LAST_NAME', 'GENDER'].includes(key)
          )
            return;

          // If no membership type exists in the array, then the default
          // membership will be set as the membership type.
          if (key === 'MEMBERSHIP_TYPE') {
            const [type] = types.filter(({ name }) => value === name);
            if (type) membership.type = type;
          }

          // IMPORTANT: The value must be a valid input to the Date constructor
          // or else errors will be thrown!
          else if (key === 'DATE_JOINED') {
            const dateValue = new Date(value);
            if (!dateValue) return;
            membership.joinedOn = moment.utc(dateValue).format();
          }

          // If the community has stored paid data, we need to check the last
          // time they paid. It's important that the associated membership
          // type.
          else if (key === 'LAST_PAID_AT') {
            const dateValue = new Date(value);
            if (dateValue)
              bm.membershipPaymentRepo().createAndPersist({
                createdAt: moment.utc(dateValue).format(),
                membership,
                updatedAt: moment.utc(dateValue).format()
              });
          }

          // If the question wasn't a special category question, then we find
          // the question with the given key as the title. We proceed to make
          // the appropriate membership data.
          else {
            const [question] = questions.filter(({ title }) => key === title);
            if (!question) return;
            bm.membershipDataRepo().createData({ membership, question, value });
          }
        });
      })
    );

    await this.flush('COMMUNITY_CSV_PROCESSED', community);
    return community;
  };

  /**
   * Reorders the question and places it at the given order. Acts like
   * reordering an array. Loops through all of the questions and moves the
   * order if appropriate.
   */
  reorderQuestion = async ({
    communityId,
    questionId,
    order
  }: ReorderQuestionArgs): Promise<Community> => {
    const community: Community = await this.findOne({ id: communityId }, [
      'questions'
    ]);

    const questions = community.questions.getItems();

    // Update the order of the question that we need to update.
    const currIndex = questions.findIndex(({ id }) => id === questionId);
    questions[currIndex].order = order;

    questions.forEach((question: MembershipQuestion, i: number) => {
      if (i === currIndex) question.order = order;
      else if (i < currIndex && i >= order) question.order++;
      else if (i > currIndex && i <= order) question.order--;
    });

    await this.flush('REORDER_QUESTION', questions);
    return community;
  };

  /**
   * Returns the updated community after updating it's Mailchimp token. If
   * no community was found based on the encodedUrlName, returns null.
   * Otherwise, exchanges the
   */
  storeMailchimpTokenFromCode = async (
    encodedUrlName: string,
    code: string
  ): Promise<Community> => {
    const community: Community = await this.findOne({ encodedUrlName }, [
      'integrations'
    ]);

    if (!community) return null;

    const token: string = await getTokenFromCode(code);
    community.integrations.mailchimpAccessToken = token;

    await this.flush('MAILCHIMP_TOKEN_STORED', community);
    return community;
  };

  /**
   * Stores the Zoom tokens in the database after executing the
   * OAuth token flow, and returns the community following execution.
   *
   * @param code Zoom's API produced authorization code that we exchange for
   * tokens.
   */
  storeZoomTokensFromCode = async (
    encodedUrlName: string,
    code: string
  ): Promise<Community> => {
    const community: Community = await this.findOne({ encodedUrlName }, [
      'integrations'
    ]);

    if (!community) return null;

    const { accessToken, refreshToken } = await getTokensFromCode(code);
    community.integrations.zoomAccessToken = accessToken;
    community.integrations.zoomRefreshToken = refreshToken;

    await this.flush('ZOOM_TOKENS_STORED', community);
    return community;
  };

  /**
   * Refreshes the Zoom tokens for the community with the following ID.
   *
   * Precondition: A zoomRefreshToken must already exist in the Community.
   */
  refreshZoomTokens = async (communityId: string): Promise<Community> => {
    const community = await this.findOne({ id: communityId }, ['integrations']);
    const { accessToken, refreshToken } = await refreshAccessToken(
      community.integrations.zoomRefreshToken
    );

    if (!accessToken && !refreshToken) return community;

    community.integrations.zoomAccessToken = accessToken;
    community.integrations.zoomRefreshToken = refreshToken;

    await this.flush('ZOOM_TOKENS_REFRESHED', community);
    return community;
  };
}
