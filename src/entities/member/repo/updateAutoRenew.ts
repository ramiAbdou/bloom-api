import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class UpdateAutoRenewArgs {
  @Field(() => Boolean)
  status: boolean;
}

const updateAutoRenew = async (
  { status }: UpdateAutoRenewArgs,
  { memberId }: GQLContext
) => {
  return new BloomManager().findOneAndUpdate(
    Member,
    { id: memberId },
    { autoRenew: status },
    { event: 'AUTO_RENEW_UPDATED' }
  );
};

export default updateAutoRenew;
