import { APP } from '@constants';
import BaseRepo from '@core/db/BaseRepo';
import { sendEmail } from '@core/emails';
import Community from '../community/Community';
import Member from './Member';

export default class MemberRepo extends BaseRepo<Member> {
  /**
   * Fetches the appropriate data to send in a member ACCEPTED email.
   */
  sendMemberAcceptedEmails = async (
    members: Member[],
    community: Community
  ) => {
    const bm = this.bm();

    await Promise.all(
      members.map(async ({ user }: Member) => {
        const { email, firstName } = user;

        await sendEmail(
          'member-accepted.mjml',
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
   * Fetches the appropriate data to send in a member REJECTED email.
   */
  sendMemberIgnoredEmails = async (members: Member[], community: Community) => {
    // We have to fetch email and name of the community owner.
    await community.members.init({
      populate: ['user'],
      where: { role: 'OWNER' }
    });

    const { email: ownerEmail, fullName: ownerFullName } =
      community.members[0]?.user || {};

    await Promise.all(
      members.map(async ({ user }: Member) => {
        const { email, firstName } = user;

        await sendEmail(
          'member-accepted.mjml',
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
   * Fetches the appropriate data to send in a member REJECTED email.
   */
  sendMemberReceievedEmail = async (member: Member, community: Community) => {
    // We have to fetch email and name of the community owner.
    await community.members.init({
      populate: ['user'],
      where: { role: 'OWNER' }
    });

    const { email: ownerEmail, fullName: ownerFullName } =
      community.members[0]?.user || {};

    const { email, firstName } = member.user;

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

  /**
   * Sends an email notification to the user who recently had a member
   * added to their account by the community admin.
   */
  private sendMemberInvitationEmails = async (
    members: Member[],
    community: Community
  ) => {
    const { name: communityName } = community;

    await Promise.all(
      members.map(async ({ user }) => {
        const { email, firstName } = user;

        await sendEmail(
          'member-invitation.mjml',
          `You've Been Invited to Join ${communityName}`,
          email,
          { clientUrl: `${APP.CLIENT_URL}/login`, communityName, firstName }
        );
      })
    );
  };

  /**
   * Sends an email notification to the user who recently had an
   * ADMINISTRATIVE member added to their account by the community admin.
   */
  private sendAdminInvitationEmail = async (
    members: Member[],
    community: Community
  ) => {
    const { name: communityName } = community;

    await Promise.all(
      members.map(async ({ user }) => {
        const { email, firstName } = user;

        await sendEmail(
          'member-invitation.mjml',
          `You've Been Invited to Join ${communityName}`,
          email,
          { clientUrl: `${APP.CLIENT_URL}/login`, communityName, firstName }
        );
      })
    );
  };
}
