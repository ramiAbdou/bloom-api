/**
 * @fileoverview Repository: Community
 * @author Rami Abdou
 */

import csv from 'csvtojson';
import { EntityData } from 'mikro-orm';

import { FormQuestionCategory } from '@constants';
import { Membership, User } from '@entities';
import MailchimpAuth from '@integrations/mailchimp/MailchimpAuth';
import BaseRepo from '@util/db/BaseRepo';
import ZoomAuth from '../../integrations/zoom/ZoomAuth';
import Community from './Community';

export default class CommunityRepo extends BaseRepo<Community> {
  /**
   * Creates a new community when Bloom has a new customer. Omits the addition
   * of a logo. For now, the community should send Bloom a square logo that
   * we will manually add to the Digital Ocean space.
   */
  async createCommunity(
    data: EntityData<Community>,
    hasCSV = false
  ): Promise<Community> {
    const community: Community = this.createAndPersist(data);
    if (hasCSV) await this.importCSVDataToCommunity(community);
    await this.flush('COMMUNITY_CREATED', community);
    return community;
  }

  /**
   * This should only be called in the process of creating a community for the
   * first time, NOT updating the community. It first reads the CSV file
   * with the associated community name, then either creates Memberships with
   * NEW users if the email is not found in the DB based on the CSV row, or
   * adds a Membership based on the current users in our DB.
   */
  private async importCSVDataToCommunity(community: Community) {
    const responses = await csv().fromFile(
      `./membership-csv/${community.name}.csv`
    );

    await Promise.all(
      responses.map(async (row: Record<string, any>) => {
        // Precondition: Every row (JSON) should have a field called 'EMAIL'.
        const email = row[FormQuestionCategory.EMAIL];

        // If the user already exists, fetch it from the DB and if not, create
        // a new user for the membership.

        const user: User =
          (await this.userRepo().findOne({ email })) ?? new User();

        // We persist the membership instead of the user since the user can
        // potentially be persisted already.
        const membership: Membership = this.membershipRepo().create({});
        const membershipData: Record<string, any> = {};

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

  /**
   * Returns the updated community after updating it's Mailchimp token. If
   * no community was found based on the encodedUrlName, returns null.
   * Otherwise, exchanges the
   */
  storeMailchimpToken = async (
    encodedUrlName: string,
    code: string
  ): Promise<Community> => {
    const community: Community = await this.findOne({
      encodedUrlName: encodedUrlName as string
    });

    if (!community) return null;

    const token: string = await new MailchimpAuth().getTokenFromCode(code);
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
  storeZoomTokens = async (
    encodedUrlName: string,
    code: string
  ): Promise<Community> => {
    const community: Community = await this.findOne({ encodedUrlName });
    if (!community) return null;

    const {
      accessToken,
      refreshToken
    } = await new ZoomAuth().getTokensFromCode(code);

    community.zoomAccessToken = accessToken;
    community.zoomRefreshToken = refreshToken;
    await this.flush('ZOOM_TOKENS_STORED', community);

    return community;
  };
}
