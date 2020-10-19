/**
 * @fileoverview Repository: Membership
 * @author Rami Abdou
 */

import BaseRepo from '@util/db/BaseRepo';
import { MembershipDataInput } from '@util/gql';
import { stringify } from '@util/util';
import Community from '../community/Community';
import MembershipData from '../membership-data/MembershipData';
import User from '../user/User';
import Membership, { MembershipStatus } from './Membership';
import { MembershipRole } from './MembershipArgs';

export default class MembershipRepo extends BaseRepo<Membership> {
  /**
   * Fetches all of the applicants for a community that are still pending.
   */
  getApplicants = async (
    communityId: string,
    populate: string[]
  ): Promise<Membership[]> =>
    this.find(
      { community: { id: communityId }, status: 'PENDING' },
      MembershipRepo.parsePopulate(populate)
    );

  /**
   * Applies for membership in the community using the given email and data.
   * A user is either created OR fetched based on the email.
   */
  applyForMembership = async (
    communityId: string,
    email: string,
    data: MembershipDataInput[]
  ): Promise<Membership> => {
    const bm = this.bm();
    const community = await bm
      .communityRepo()
      .findOne({ id: communityId }, ['questions', 'types']);

    // The user can potentially already exist if they are a part of other
    // communities.
    const user: User =
      (await bm.userRepo().findOne({ email })) ??
      bm.userRepo().createAndPersist({ email });

    if (await this.findOne({ community, user }))
      throw new Error('Membership has already been created.');

    // We persist the membership instead of the user since the user can
    // potentially be persisted already.
    const membership: Membership = bm
      .membershipRepo()
      .createAndPersist({ community, user });

    const questions = community.questions.getItems();
    const types = community.types.getItems();

    // We only use a Promise for the Membership Type case since we need to
    // fetch the type from the DB.
    await Promise.all(
      data.map(async ({ questionId, value: valueArray }) => {
        // If there's no value, then short circuit. Because for the initial
        // creation of data, it must exist.
        if (!valueArray || !valueArray.length) return;

        const [question] = questions.filter(({ id }) => questionId === id);
        const { category } = question;
        const value = stringify(valueArray);

        if (category === 'EMAIL') user.email = value;
        else if (category === 'FIRST_NAME') user.firstName = value;
        else if (category === 'LAST_NAME') user.lastName = value;
        else if (category === 'GENDER') user.gender = value;
        else if (category === 'MEMBERSHIP_TYPE') {
          const [type] = types.filter(({ name }) => value === name);
          if (type) membership.type = type;
        } else
          bm.membershipDataRepo().createData({ membership, question, value });
      })
    );

    await this.persistAndFlush(membership, 'MEMBERSHIP_CREATED');
    return membership;
  };

  /**
   * Soft deletes all the memberships that are found using the array of
   * membershipIds.
   */
  deleteMemberships = async (membershipIds: string[]): Promise<boolean> => {
    const memberships: Membership[] = await this.find({ id: membershipIds });
    await this.deleteAndFlush(memberships, 'MEMBERSHIPS_DELETED');
    return true;
  };

  /**
   * Updates the membership data that is specified, and leaves all other
   * membership data alone.
   */
  updateMembershipData = async (
    membershipId: string,
    data: MembershipDataInput[]
  ): Promise<Membership> => {
    const membership: Membership = await this.findOne({ id: membershipId });
    const bm = this.bm();

    await Promise.all(
      data.map(
        async ({ questionId, value: valueArray }: MembershipDataInput) => {
          // Find the membership question that is associated with the data.
          const question = await bm
            .membershipQuestionRepo()
            .findOne({ id: questionId });

          const membershipData: MembershipData = await bm
            .membershipDataRepo()
            .findOne({ membership, question });

          const value = stringify(valueArray);
          if (membershipData) membershipData.value = value;
          else
            bm.membershipDataRepo().createData({
              membership,
              question,
              value
            });
        }
      )
    );

    await this.flush('MEMBERSHIP_DATA_UPDATED', membership);
    return membership;
  };

  /**
   * An admin has the option to either accept or reject a Membership when they
   * apply to the organization.
   */
  respondToMemberships = async (
    membershipIds: string[],
    response: MembershipStatus
  ): Promise<Membership[]> => {
    const memberships: Membership[] = await this.find({ id: membershipIds });
    memberships.forEach((membership: Membership) => {
      membership.status = response;
    });

    await this.flush('MEMBERSHIP_ADMISSION', memberships);
    return memberships;
  };

  /**
   * Returns the member's role that is associated with the userId and the
   * communityId given. Returns null if the membership isn't found.
   */
  getMembershipRole = async (
    userId: string,
    communityId: string
  ): Promise<MembershipRole> => {
    const membership = await this.findOne({
      community: { id: communityId },
      user: { id: userId }
    });

    return membership?.role;
  };

  /**
   * Add a new admin to the community with the communityId.
   * - If a user exists with the email, then try to find the membership
   * associated with the user and community.
   * - If no user exists or no membership exists, then create and persist them.
   * - Set the membership role to ADMIN and set the status to 1 (APPROVED).
   */
  addNewAdmin = async (
    communityId: string,
    email: string,
    firstName: string,
    lastName: string
  ) => {
    const bm = this.bm();
    const user: User =
      (await bm.userRepo().findOne({ email })) ??
      bm.userRepo().createAndPersist({ email, firstName, lastName });

    const community: Community = await bm
      .communityRepo()
      .findOne({ id: communityId });

    const membership: Membership =
      (await this.findOne({ community, user })) ??
      this.createAndPersist({ community, user });

    membership.role = 'ADMIN';
    membership.status = 'APPROVED';

    await this.flush('ADMIN_CREATED', membership);
    return membership;
  };

  /**
   * Changes the membership to have a role that is an ADMIN and a status
   * that is APPROVED.
   */
  addAdminByMembershipId = async (membershipId: string) => {
    const membership: Membership = await this.findOne({ id: membershipId });
    membership.role = 'ADMIN';
    membership.status = 'APPROVED';

    await this.flush('ADMIN_CREATED', membership);
    return membership;
  };

  private static parsePopulate(populate: string[]) {
    return populate.reduce((acc: string[], path: string) => {
      if (path.includes('fullData')) {
        acc = [
          ...acc,
          'community.questions',
          path.replace('fullData', 'data'),
          'type',
          'user'
        ];
      } else acc.push(path);
      return acc;
    }, []);
  }
}
