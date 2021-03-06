import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class IsEmailTakenArgs {
  @Field()
  communityId: string;

  @Field()
  email: string;
}

/**
 * Returns true if there is no Member in the Community with the given email.
 *
 * @param args.communityId - ID of the Community.
 * @param args.email - Email to verify.
 */
const isEmailTaken = async (args: IsEmailTakenArgs): Promise<boolean> => {
  const { communityId, email } = args;

  const member: Member = await new BloomManager().findOne(
    Member,
    { community: communityId, email },
    { populate: ['community'] }
  );

  if (member) {
    throw new Error(
      `This email is already registered in ${member.community.name}.`
    );
  }

  return true;
};

export default isEmailTaken;
