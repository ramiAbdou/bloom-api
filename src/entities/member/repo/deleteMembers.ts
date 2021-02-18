import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class DeleteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

const deleteMembers = async ({
  memberIds
}: DeleteMembersArgs): Promise<Member[]> => {
  return new BloomManager().findAndDelete(
    Member,
    { id: memberIds },
    { event: 'DELETE_MEMBERS', soft: true }
  );
};

export default deleteMembers;
