import { APP, Event } from '@constants';
import cache from '@core/cache';
import BaseRepo from '@core/db/BaseRepo';
import { sendEmail } from '@core/emails';
import { now } from '@util/util';
import Community from '../community/Community';
import User from '../user/User';
import Member from './Member';
import { MemberDataInput, MemberStatus, NewMemberInput } from './Member.args';

export default class MemberRepo extends BaseRepo<Member> {
  /**
   * Applies for member in the community using the given email and data.
   * A user is either created OR fetched based on the email.
   */
  applyForMember = async (
    encodedUrlName: string,
    email: string,
    data: MemberDataInput[]
  ): Promise<Member> => {
    const bm = this.bm();

    // Populate the questions and types so that we can capture the member
    // data in a relational manner.
    const community = await bm
      .communityRepo()
      .findOne({ encodedUrlName }, ['integrations', 'questions', 'types']);

    // The user can potentially already exist if they are a part of other
    // communities.
    const user: User =
      (await bm.userRepo().findOne({ email })) ??
      bm.userRepo().createAndPersist({ email });

    if (await this.findOne({ community, user })) {
      throw new Error(
        `This email is already registered in the ${community.name} community.`
      );
    }

    const member: Member = bm
      .memberRepo()
      .createAndPersist({ community, user });

    const questions = community.questions.getItems();
    const types = community.types.getItems();

    // Some data we store on the user entity, and some we store as member
    // data.
    data.forEach(({ questionId, value: valueArray }) => {
      // If there's no value, then short circuit. Because for the initial
      // creation of data, it must exist.
      if (!valueArray || !valueArray.length) return;

      const question = questions.find(({ id }) => questionId === id);
      const { category } = question;

      const value =
        question.type === 'MULTIPLE_SELECT' ? valueArray : valueArray[0];

      if (category === 'EMAIL') user.email = value as string;
      else if (category === 'FIRST_NAME') user.firstName = value as string;
      else if (category === 'LAST_NAME') user.lastName = value as string;
      else if (category === 'GENDER') user.gender = value as string;
      else if (category === 'MEMBERSHIP_TYPE') {
        const type = types.find(({ name }) => value === name);
        if (type) member.type = type;
      } else {
        bm.memberDataRepo().createAndPersist({
          member,
          question,
          value
        });
      }
    });

    await this.persistAndFlush(member, 'MEMBERSHIP_CREATED');

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
      if (community.autoAccept) {
        await this.sendMemberAcceptedEmails([member], community);
      } else await this.sendMemberReceievedEmail(member, community);
    }, 0);

    return member;
  };

  /**
   * An admin has the option to either accept or reject a Member when they
   * apply to the organization.
   */
  respondToMembers = async (
    memberIds: string[],
    response: MemberStatus,
    communityId: string
  ): Promise<Member[]> => {
    const members: Member[] = await this.find({ id: memberIds }, ['user']);

    members.forEach((member: Member) => {
      member.joinedOn = now();
      member.status = response;
    });

    await this.flush('MEMBERSHIP_ADMISSION', members);

    cache.invalidateEntries([`${Event.GET_APPLICANTS}-${communityId}`], true);

    if (response === 'ACCEPTED') {
      cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);
    }

    // Send the appropriate emails based on the response. Also, add the members
    // to the Mailchimp audience.
    setTimeout(async () => {
      const community: Community = await this.bm()
        .communityRepo()
        .findOne({ id: communityId }, ['integrations']);

      if (response === 'ACCEPTED') {
        await this.sendMemberAcceptedEmails(members, community);

        await this.bm()
          .communityIntegrationsRepo()
          .addToMailchimpAudience(members, community);
      } else await this.sendMemberIgnoredEmails(members, community);
    }, 0);

    return members;
  };

  /**
   * Deletes the following members.
   */
  deleteMembers = async (
    memberIds: string[],
    communityId: string
  ): Promise<boolean> => {
    const members: Member[] = await this.find({ id: memberIds }, ['user']);

    await this.deleteAndFlush(members, 'MEMBERSHIPS_DELETED');

    // If any of the members were an ADMIN of the community, then we need to
    // invalidate the GET_ADMINS cache key.
    if (members.some(({ role }) => !!role)) {
      cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);
    }

    cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);

    return true;
  };

  /**
   * Toggles the admin status of the member. If the role of the members
   * were previously ADMIN, they become null, and vice versa.
   */
  toggleAdmins = async (
    memberIds: string[],
    communityId: string
  ): Promise<Member[]> => {
    const members: Member[] = await this.find({ id: memberIds });

    members.forEach((member: Member) => {
      if (!member.role) member.role = 'ADMIN';
      else member.role = null;
    });

    await this.flush('MEMBERSHIPS_ADMIN_STATUS_UPDATED', members);

    // Invalidate the cache for the GET_MEMBERS call.
    cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);

    return members;
  };

  /**
   * Creates new members when invited by the admin of the community.
   */
  createMembers = async (
    memberInputs: NewMemberInput[],
    communityId: string
  ): Promise<Member[]> => {
    const bm = this.bm();

    const community: Community = await bm
      .communityRepo()
      .findOne({ id: communityId }, ['integrations', 'types']);

    const existingMembers: Member[] = await bm.memberRepo().find({
      community,
      user: { email: memberInputs.map(({ email }) => email.toLowerCase()) }
    });

    if (existingMembers.length) {
      throw new Error(
        'At least 1 of these emails already exists in this community.'
      );
    }

    const members: Member[] = await Promise.all(
      memberInputs.map(async ({ isAdmin, email, firstName, lastName }) =>
        bm.memberRepo().createAndPersist({
          community,
          role: isAdmin ? 'ADMIN' : null,
          status: 'INVITED',
          // The user can potentially already exist if they are a part of other
          // communities.
          user:
            (await bm.userRepo().findOne({ email })) ??
            bm.userRepo().createAndPersist({ email, firstName, lastName })
        })
      )
    );

    await this.flush('MEMBERSHIPS_CREATED', members);
    cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);

    await this.em.populate(members, ['community.questions', 'data']);

    // Send the appropriate emails based on the response. Also, add the members
    // to the Mailchimp audience.
    setTimeout(async () => {
      await this.bm()
        .communityIntegrationsRepo()
        .addToMailchimpAudience(members, community);
    }, 0);

    return members;
  };

  /**
   * Updates all of the INVITED statuses to ACCEPTED on a member.
   * Precondition: Should only be called when a user is logging into Bloom.
   */
  updateInvitedStatuses = async (members: Member[]) => {
    await Promise.all(
      members.map(async (member: Member) => {
        if (member.status === 'INVITED') member.status = 'ACCEPTED';
      })
    );

    await this.flush('MEMBERSHIPS_INVITED_STATUS_UPDATED', members);
  };

  getTimeSeries = async (communityId: string) => {
    const members = await this.find(
      { community: { id: communityId } },
      { filters: false }
    );
  };

  // ## EMAIL HELPERS

  /**
   * Fetches the appropriate data to send in a member ACCEPTED email.
   */
  private sendMemberAcceptedEmails = async (
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
  private sendMemberIgnoredEmails = async (
    members: Member[],
    community: Community
  ) => {
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
  private sendMemberReceievedEmail = async (
    member: Member,
    community: Community
  ) => {
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
