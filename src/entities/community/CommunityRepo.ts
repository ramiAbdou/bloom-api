/**
 * @fileoverview Repository: Community
 * @author Rami Abdou
 */

import csv from 'csvtojson';
import { EntityData, EntityRepository, Repository } from 'mikro-orm';

import { FormQuestionCategory } from '@constants';
import { Membership, User } from '@entities/entities';
import MailchimpAuth from '@integrations/mailchimp/MailchimpAuth';
import BloomManager from '@util/db/BloomManager';
import Community from './Community';

@Repository(Community)
export default class CommunityRepo extends EntityRepository<Community> {
  bm: BloomManager = new BloomManager(this.em);

  /**
   * Creates a new community when Bloom has a new customer. Omits the addition
   * of a logo. For now, the community should send Bloom a square logo that
   * we will manually add to the Digital Ocean space.
   */
  createCommunity = async (
    data: EntityData<Community>,
    hasCSV: boolean
  ): Promise<Community> => {
    const community: Community = this.create(data);
    if (hasCSV) await this.importCSVDataToCommunity(community);
    await this.bm.flush(`${community.name} has been created!`, { community });
    return community;
  };

  /**
   * This should only be called in the process of creating a community for the
   * first time, NOT updating the community. It first reads the CSV file
   * with the associated community name, then either creates Memberships with
   * NEW users if the email is not found in the DB based on the CSV row, or
   * adds a Membership based on the current users in our DB.
   */
  private importCSVDataToCommunity = async (community: Community) => {
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
          (await this.bm.userRepo().findOne({ email })) ?? new User();

        // We persist the membership instead of the user since the user can
        // potentially be persisted already.
        const membership: Membership = new Membership();
        const membershipData: Record<string, any> = {};

        membership.community = community;
        membership.data = membershipData;
        membership.user = user;

        this.persist(membership);

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
  };

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
    await this.bm.flush(`Mailchimp token stored for ${community.name}.`, {
      community
    });
    return community;
  };
}
