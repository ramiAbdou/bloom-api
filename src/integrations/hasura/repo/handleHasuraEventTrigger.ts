import camelCaseKeys from 'camelcase-keys';
import express from 'express';

import handleCreateEvent from '../events/handleCreateEvent';
import handleCreateEventGuest from '../events/handleCreateEventGuest';
import handleDeleteEvent from '../events/handleDeleteEvent';
import handleDeleteMember from '../events/handleDeleteMember';
import handleUpdateMemberRole from '../events/handleUpdateMemberRole';
import handleUpdateMemberStatus from '../events/handleUpdateMemberStatus';
import { HasuraEventPayload, HasuraEventTrigger } from '../Hasura.types';

/**
 * Returns a 200 response if the Hasura event was handled successfully.
 *
 * @param req - Express Request object that stores the trigger body.
 * @param res - Express Response object to respond with.
 */
const handleHasuraEventTrigger = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  const payload: HasuraEventPayload = camelCaseKeys(req.body, { deep: true });
  console.log('hasura event caught', payload.trigger.name);

  switch (payload.trigger.name) {
    case HasuraEventTrigger.CREATE_EVENT:
      handleCreateEvent(payload);
      break;

    case HasuraEventTrigger.CREATE_EVENT_GUEST:
      handleCreateEventGuest(payload);
      break;

    case HasuraEventTrigger.DELETE_EVENT:
      handleDeleteEvent(payload);
      break;

    case HasuraEventTrigger.DELETE_MEMBER:
      handleDeleteMember(payload);
      break;

    case HasuraEventTrigger.UPDATE_MEMBER_ROLE:
      handleUpdateMemberRole(payload);
      break;

    case HasuraEventTrigger.UPDATE_MEMBER_STATUS:
      handleUpdateMemberStatus(payload);
      break;

    default:
      break;
  }

  return res.sendStatus(200);
};

export default handleHasuraEventTrigger;
