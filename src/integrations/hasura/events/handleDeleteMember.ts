import { HasuraEventPayload } from '@integrations/hasura/Hasura.types';

const handleDeleteMember = async (
  payload: HasuraEventPayload
): Promise<boolean> => {
  // emitEmailEvent(
  //   EmailEvent.DELETE_MEMBERS,
  //   { communityId, memberIds } as DeleteMembersPayload,
  //   { delay: 5000 }
  // );
  return true;
};

export default handleDeleteMember;
