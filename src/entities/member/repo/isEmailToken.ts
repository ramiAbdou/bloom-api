import deline from 'deline';
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

const isEmailTaken = async ({ communityId, email }: IsEmailTakenArgs) => {
  const member: Member = await new BloomManager().findOne(
    Member,
    { community: { id: communityId }, user: { email } },
    { populate: ['community'] }
  );

  if (member) {
    throw new Error(
      deline`
        This email is already registered in the ${member?.community?.name}
        community.
      `
    );
  }

  return true;
};

export default isEmailTaken;
