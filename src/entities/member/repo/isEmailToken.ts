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
      `This email is already registered in ${member?.community?.name}.`
    );
  }

  return true;
};

export default isEmailTaken;
