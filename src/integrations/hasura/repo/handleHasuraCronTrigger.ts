import express from 'express';

import handleExecutePendingTasks from '../cron/handleExecutePendingTasks';
import { HasuraCronTrigger } from '../Hasura.types';

/**
 * Returns a 200 response along with JSON that specifies the permissions of the
 * signed-in (or not signed-in) user.
 *
 * @param req - Express Request object that stores the trigger body.
 * @param res - Express Response object to respond with.
 */
const handleHasuraCronTrigger = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  console.log(req.body);
  console.log(req.headers);
  console.log(req.url);

  const event = req.body.event as HasuraCronTrigger;

  switch (event) {
    case HasuraCronTrigger.EXECUTE_PENDING_TASKS:
      await handleExecutePendingTasks();
      break;

    default:
      break;
  }

  return res.sendStatus(200);
};

export default handleHasuraCronTrigger;
