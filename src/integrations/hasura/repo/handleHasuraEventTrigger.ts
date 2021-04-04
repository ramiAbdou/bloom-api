import camelCaseKeys from 'camelcase-keys';
import express from 'express';

import handleCreateEventGuest from '@entities/event-guest/repo/handleCreateEventGuest';
import handleDeleteEvent from '@entities/event/repo/handleDeleteEvent';
import { HasuraEvent, HasuraEventPayload } from '../Hasura.types';

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
    case HasuraEvent.CREATE_EVENT_GUEST:
      handleCreateEventGuest(payload);
      break;

    case HasuraEvent.DELETE_EVENT:
      handleDeleteEvent(payload);
      break;

    default:
      break;
  }

  return res.sendStatus(200);
};

export default handleHasuraEventTrigger;
