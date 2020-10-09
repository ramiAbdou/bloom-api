/**
 * @fileoverview Repository: Membership
 * @author Rami Abdou
 */

import { FormQuestionCategory, FormValueInput } from '@constants';
import { Community, User } from '@entities/entities';
import BaseRepo from '@util/db/BaseRepo';
import Membership from './Membership';

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

    await this.persistAndFlush(
      membership,
      `Membership created for ${user.fullName}.`,
      { user }
    );
    return membership;
  };

  /**
   * Updates the membership data that is specified, and leaves all other
   * membership data alone.
   */
  updateMembershipData = async (
    membershipId: string,
    data: FormValueInput[]
  ): Promise<Membership> => {
    const membership: Membership = await this.findOne({ id: membershipId }, [
      'community',
      'type',
      'user'
    ]);

    data.forEach(({ title, value }: FormValueInput) => {
      membership.data[title] = value;
    });

    const { user } = membership;
    await this.flush(`Membership data updated for ${user.fullName}.`, { user });
    return membership;
  };

  /**
   * An admin has the option to either accept or reject a Membership when they
   * apply to the organization.
   */
  respondToMembership = async (
    membershipId: string,
    adminId: string,
    response: number
  ): Promise<Membership> => {
    const [membership, admin]: [Membership, User] = await Promise.all([
      this.findOne({ id: membershipId }, ['user']),
      this.userRepo().findOne({ id: adminId })
    ]);

    membership.status = response;

    await this.flush(
      `${admin.fullName} responded to ${membership.user.fullName}'s membership
      application.`,
      { admin, membership }
    );

    return membership;
  };
}
