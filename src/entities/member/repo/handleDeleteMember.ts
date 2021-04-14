import { HasuraEventPayload } from '@integrations/hasura/Hasura.types';

const handleDeleteMember = (payload: HasuraEventPayload) => {
  // emitEmailEvent(
  //   EmailEvent.DELETE_MEMBERS,
  //   { communityId, memberIds } as DeleteMembersPayload,
  //   { delay: 5000 }
  // );
};

export default handleDeleteMember;
