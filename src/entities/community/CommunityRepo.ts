/**
 * @fileoverview Repository: Community
 * @author Rami Abdou
 */

import csv from 'csvtojson';
import moment from 'moment';

import { Membership, User } from '@entities';
import { getTokenFromCode } from '@integrations/mailchimp/MailchimpUtil';
import {
  getTokensFromCode,
  refreshAccessToken
} from '@integrations/zoom/ZoomUtil';
import BaseRepo from '@util/db/BaseRepo';
import { MembershipTypeInput } from '../membership-type/MembershipTypeArgs';
import Community from './Community';
import { CreateCommunityArgs, ImportCommunityCSVArgs } from './CommunityArgs';

export default class CommunityRepo extends BaseRepo<Community> {
  /**
   * Creates a new community when Bloom has a new customer. Omits the addition
   * of a logo. For now, the community should send Bloom a square logo that
   * we will manually add to the Digital Ocean space.
   */
  createCommunity = async ({
    applicationDescription: description,
    applicationTitle: title,
    autoAccept,
    name,
    questions,
    overview,
    types
  }: CreateCommunityArgs): Promise<Community> => {
    const bm = this.bm();

    const community: Community = this.createAndPersist({
      ...(title
        ? {
            application: bm
              .communityApplicationRepo()
              .create({ description, title })
          }
        : {}),
      ...(overview ? { overview } : {}),
      autoAccept,
      name,
      questions: questions.map((question, i: number) =>
        bm.membershipQuestionRepo().create({
          ...question,
          options: question.options?.map(({ value }) =>
            bm.membershipQuestionOptionRepo().create({ question, value })
          ),
          order: i
        })
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
    // INCLUDING case insensitive duplicates.
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

        // We persist the membership instead of the user since the user can
        // potentially be persisted already.
        const membership: Membership = bm
          .membershipRepo()
          .createAndPersist({ community, status: 'APPROVED', user });

        // eslint-disable-next-line array-callback-return
        Object.entries(row).map(([key, value]) => {
          if (['FIRST_NAME', 'LAST_NAME', 'GENDER'].includes(key)) return;
          if (key === 'MEMBERSHIP_TYPE') {
            const [type] = types.filter(({ name }) => value === name);
            if (type) membership.type = type;
          } else if (key === 'DATE_JOINED') {
            if (value)
              membership.joinedOn = moment.utc(new Date(value)).format();
          } else {
            const [question] = questions.filter(({ title }) => key === title);
            if (question)
              bm.membershipDataRepo().create({ membership, question, value });
          }
        });
      })
    );

    await this.flush('COMMUNITY_CSV_PROCESSED', community);
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
    const community: Community = await this.findOne({ encodedUrlName });
    if (!community) return null;

    const token: string = await getTokenFromCode(code);
    community.mailchimpAccessToken = token;

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
    const community: Community = await this.findOne({ encodedUrlName });

    if (!community) return null;

    const { accessToken, refreshToken } = await getTokensFromCode(code);
    community.zoomAccessToken = accessToken;
    community.zoomRefreshToken = refreshToken;

    await this.flush('ZOOM_TOKENS_STORED', community);
    return community;
  };

  /**
   * Refreshes the Zoom tokens for the community with the following ID.
   *
   * Precondition: A zoomRefreshToken must already exist in the Community.
   */
  refreshZoomTokens = async (communityId: string): Promise<Community> => {
    const community = await this.findOne({ id: communityId });
    const { accessToken, refreshToken } = await refreshAccessToken(
      community.zoomRefreshToken
    );

    if (!accessToken && !refreshToken) return community;

    community.zoomAccessToken = accessToken;
    community.zoomRefreshToken = refreshToken;

    await this.flush('ZOOM_TOKENS_REFRESHED', community);
    return community;
  };
}
