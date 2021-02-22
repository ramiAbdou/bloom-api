import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import { now } from '@util/util';
import Member, { MemberStatus } from '../Member';

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
const respondToApplicants = async ({
  memberIds,
  response
}: RespondToApplicantsArgs): Promise<Member[]> => {
  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { id: memberIds },
    { joinedAt: now(), status: response },
    {
      flushEvent:
        response === MemberStatus.ACCEPTED
          ? FlushEvent.ACCEPT_APPLICANTS
          : FlushEvent.IGNORE_APPLICANTS
    }
  );

  return members;
};

export default respondToApplicants;
