import { ArgsType, Field } from 'type-graphql';

import { Event, GQLContext } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import { now } from '@util/util';
import Member from '../Member';
import { MemberStatus } from '../Member.types';

// import addToMailchimpAudience from '@entities/community-integrations/repo/addToMailchimpAudience';
// import Community from '../../community/Community';

@ArgsType()
export class RespondToApplicantsArgs {
  @Field(() => [String])
  memberIds: string[];

  @Field(() => String)
  response: MemberStatus;
}

/**
 * An admin has the option to either accept or reject a Member when they
 * apply to the organization.
 */
export default async (
  { memberIds, response }: RespondToApplicantsArgs,
  { communityId }: GQLContext
): Promise<Member[]> => {
  const bm = new BloomManager();

  const members: Member[] = await bm.find(
    Member,
    { id: memberIds },
    { populate: ['user'] }
  );

  members.forEach((member: Member) => {
    member.joinedOn = now();
    member.status = response;
  });

  await bm.flush('MEMBERS_ACCEPTED');

  cache.invalidateEntries([`${Event.GET_APPLICANTS}-${communityId}`], true);

  if (response === 'ACCEPTED') {
    cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);
  }

  // Send the appropriate emails based on the response. Also, add the members
  // to the Mailchimp audience.
  setTimeout(async () => {
    // const community: Community = await communityRepo.findOne(
    //   { id: communityId },
    //   ['integrations']
    // );
    // if (response === 'ACCEPTED') {
    //   await memberRepo.sendMemberAcceptedEmails(members, community);
    //   await addToMailchimpAudience(members, community);
    // } else await memberRepo.sendMemberIgnoredEmails(members, community);
  }, 0);

  return members;
};
