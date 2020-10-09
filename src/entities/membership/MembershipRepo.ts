/**
 * @fileoverview Repository: Membership
 * @author Rami Abdou
 */

import { FormQuestionCategory, FormValueInput } from '@constants';
import { Community, User } from '@entities';
import BaseRepo from '@util/db/BaseRepo';
import Membership from './Membership';
import { MembershipRole } from './MembershipArgs';

export default class MembershipRepo extends BaseRepo<Membership> {
  /**
   * Creates a Membership is for the given Community ID, and also creates a
   * User with the basic information from the membership data.
   */
  createMembership = async (
    communityId: string,
    data: FormValueInput[],
    userId?: string
  ): Promise<Membership> => {
    const community: Community = await this.communityRepo().findOne({
      id: communityId
    });

    // The user can potentially already exist if they are a part of other
    // communities.
    const user: User = userId
      ? await this.userRepo().findOne({ id: userId })
      : new User();

    const membership: Membership = new Membership();
    const membershipData: Record<string, any> = {};

    membership.community = community;
    membership.data = membershipData;
    membership.user = user;

    // We only use a Promise for the Membership Type case since we need to
    // fetch the type from the DB.
    await Promise.all(
      data.map(async ({ category, title, value }: FormValueInput) => {
        if (category === FormQuestionCategory.FIRST_NAME)
          user.firstName = value;
        else if (category === FormQuestionCategory.LAST_NAME)
          user.lastName = value;
        else if (category === FormQuestionCategory.EMAIL) user.email = value;
        else if (category === FormQuestionCategory.GENDER) user.gender = value;
        else membershipData[title] = value;
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
    data: FormValueInput[]
  ): Promise<Membership> => {
    const membership: Membership = await this.findOne({ id: membershipId });

    data.forEach(({ title, value }: FormValueInput) => {
      membership.data[title] = value;
    });

    await this.flush('MEMBERSHIP_DATA_UPDATED', membership);
    return membership;
  };

  /**
   * An admin has the option to either accept or reject a Membership when they
   * apply to the organization.
   */
  respondToMemberships = async (
    membershipIds: string[],
    response: number
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
    const membership: Membership = await this.findOne({
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
    const user: User =
      (await this.userRepo().findOne({ email })) ??
      this.userRepo().createAndPersist({ email, firstName, lastName });

    const community: Community = await this.communityRepo().findOne({
      id: communityId
    });

    const membership: Membership =
      (await this.findOne({ community, user })) ??
      this.createAndPersist({ community, user });

    membership.role = 'ADMIN';
    membership.status = 1;
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
    membership.status = 1;
    await this.flush('ADMIN_CREATED', membership);
    return membership;
  };
}
