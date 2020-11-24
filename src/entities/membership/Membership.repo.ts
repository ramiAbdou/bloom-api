/**
 * @fileoverview Repository: Membership
 * @author Rami Abdou
 */

import { Event } from '@constants';
import cache from '@util/cache';
import BaseRepo from '@util/db/BaseRepo';
import { sendEmail } from '@util/emails';
import { MembershipDataInput } from '@util/gql';
import { now, stringify } from '@util/util';
import Community from '../community/Community';
import User from '../user/User';
import Membership, { MembershipStatus } from './Membership';

export default class MembershipRepo extends BaseRepo<Membership> {
  /**
   * Applies for membership in the community using the given email and data.
   * A user is either created OR fetched based on the email.
   */
  applyForMembership = async (
    encodedUrlName: string,
    email: string,
    data: MembershipDataInput[]
  ): Promise<Membership> => {
    const bm = this.bm();

    // Populate the questions and types so that we can capture the membership
    // data in a relational manner.
    const community = await bm
      .communityRepo()
      .findOne({ encodedUrlName }, ['integrations', 'questions', 'types']);

    // The user can potentially already exist if they are a part of other
    // communities.
    const user: User =
      (await bm.userRepo().findOne({ email })) ??
      bm.userRepo().createAndPersist({ email });

    if (await this.findOne({ community, user }))
      throw new Error(
        `This email is already registered in the ${community.name} community.`
      );

    const membership: Membership = bm
      .membershipRepo()
      .createAndPersist({ community, user });

    const questions = community.questions.getItems();
    const types = community.types.getItems();

    // Some data we store on the user entity, and some we store as membership
    // data.
    data.forEach(({ questionId, value: valueArray }) => {
      // If there's no value, then short circuit. Because for the initial
      // creation of data, it must exist.
      if (!valueArray || !valueArray.length) return;

      const question = questions.find(({ id }) => questionId === id);
      const { category } = question;

      // The values come as arrays, so we must CSV stringify the array.
      const value = stringify(valueArray);

      if (category === 'EMAIL') user.email = value;
      else if (category === 'FIRST_NAME') user.firstName = value;
      else if (category === 'LAST_NAME') user.lastName = value;
      else if (category === 'GENDER') user.gender = value;
      else if (category === 'MEMBERSHIP_TYPE') {
        const type = types.find(({ name }) => value === name);
        if (type) membership.type = type;
      } else
        bm.membershipDataRepo().createData({ membership, question, value });
    });

    await this.persistAndFlush(membership, 'MEMBERSHIP_CREATED');

    // Invalidate the cache for the GET_APPLICANTS call.
    cache.invalidateEntries(
      [
        `${Event.GET_APPLICANTS}-${community.id}`,
        `${Event.GET_MEMBERS}-${community.id}`
      ],
      true
    );

    // Send the appropriate emails based on the response.
    setTimeout(async () => {
      if (community.autoAccept)
        await this.sendMembershipAcceptedEmails([membership], community);
      else await this.sendMembershipReceievedEmail(membership, community);
    }, 0);

    return membership;
  };

  /**
   * An admin has the option to either accept or reject a Membership when they
   * apply to the organization.
   */
  respondToMemberships = async (
    membershipIds: string[],
    response: MembershipStatus,
    communityId: string
  ): Promise<Membership[]> => {
    const memberships: Membership[] = await this.find({ id: membershipIds }, [
      'user'
    ]);

    memberships.forEach((membership: Membership) => {
      membership.joinedOn = now();
      membership.status = response;
    });

    await this.flush('MEMBERSHIP_ADMISSION', memberships);

    // Send the appropriate emails based on the response. Also, add the members
    // to the Mailchimp audience.
    setTimeout(async () => {
      const community: Community = await this.bm()
        .communityRepo()
        .findOne({ id: communityId }, ['integrations']);

      if (response === 'ACCEPTED') {
        await this.sendMembershipAcceptedEmails(memberships, community);
        await this.bm()
          .communityIntegrationsRepo()
          .addToMailchimpAudience(memberships, community);
      } else await this.sendMembershipIgnoredEmails(memberships, community);
    }, 0);

    return memberships;
  };

  // ## EMAIL HELPERS

  /**
   * Fetches the appropriate data to send in a membership ACCEPTED email.
   */
  private sendMembershipAcceptedEmails = async (
    memberships: Membership[],
    community: Community
  ) => {
    const bm = this.bm();

    await Promise.all(
      memberships.map(async ({ user }: Membership) => {
        const { email, firstName } = user;

        await sendEmail(
          'membership-accepted.mjml',
          `Congratulations! You're Now a ${community.name} Member`,
          email,
          {
            communityName: community.name,
            firstName,
            loginUrl: await bm.userRepo().generateTemporaryLoginLink(user)
          }
        );
      })
    );
  };

  /**
   * Fetches the appropriate data to send in a membership REJECTED email.
   */
  private sendMembershipIgnoredEmails = async (
    memberships: Membership[],
    community: Community
  ) => {
    // We have to fetch email and name of the community owner.
    await community.memberships.init({
      populate: ['user'],
      where: { role: 'OWNER' }
    });

    const { email: ownerEmail, fullName: ownerFullName } =
      community.memberships[0]?.user || {};

    await Promise.all(
      memberships.map(async ({ user }: Membership) => {
        const { email, firstName } = user;

        await sendEmail(
          'membership-accepted.mjml',
          `Congratulations! You're Now a ${community.name} Member`,
          email,
          {
            communityName: community.name,
            firstName,
            ownerEmail,
            ownerFullName
          }
        );
      })
    );
  };

  /**
   * Fetches the appropriate data to send in a membership REJECTED email.
   */
  private sendMembershipReceievedEmail = async (
    membership: Membership,
    community: Community
  ) => {
    // We have to fetch email and name of the community owner.
    await community.memberships.init({
      populate: ['user'],
      where: { role: 'OWNER' }
    });

    const { email: ownerEmail, fullName: ownerFullName } =
      community.memberships[0]?.user || {};

    const { email, firstName } = membership.user;

    await sendEmail(
      'application-received.mjml',
      `Your ${community.name} Application Confirmation`,
      email,
      {
        communityName: community.name,
        email,
        firstName,
        ownerEmail,
        ownerFullName
      }
    );
  };
}
