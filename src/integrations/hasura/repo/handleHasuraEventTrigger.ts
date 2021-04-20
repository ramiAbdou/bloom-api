import camelCaseKeys from 'camelcase-keys';
import express from 'express';

import { HasuraEvent, HasuraEventPayload } from '../Hasura.types';
import handleCreateEvent from './handleCreateEvent';
import handleCreateEventGuest from './handleCreateEventGuest';
import handleDeleteEvent from './handleDeleteEvent';
import handleDeleteMember from './handleDeleteMember';
import handleUpdateMemberRole from './handleUpdateMemberRole';
import handleUpdateMemberStatus from './handleUpdateMemberStatus';

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
    case HasuraEvent.CREATE_EVENT:
      handleCreateEvent(payload);
      break;

    case HasuraEvent.CREATE_EVENT_GUEST:
      handleCreateEventGuest(payload);
      break;

    case HasuraEvent.DELETE_EVENT:
      handleDeleteEvent(payload);
      break;

    case HasuraEvent.DELETE_MEMBER:
      handleDeleteMember(payload);
      break;

    case HasuraEvent.UPDATE_MEMBER_ROLE:
      handleUpdateMemberRole(payload);
      break;

    case HasuraEvent.UPDATE_MEMBER_STATUS:
      handleUpdateMemberStatus(payload);
      break;

    default:
      break;
  }

  return res.sendStatus(200);
};

export default handleHasuraEventTrigger;
