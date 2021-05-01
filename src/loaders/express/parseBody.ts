import bodyParser from 'body-parser';
import express from 'express';

/**
 * Returns the next() function to pass onto the next Express middleware.
 *
 * If the URL is a webhook URL (ex: /stripe/webhook), we need to use the raw
 * body to parse the information. Otherwise, we want to use the bodyParser
 * JSON middleware.
 *
 * @param req - Express Request object that stores the cookies.
 * @param res - Express Response object to store new tokens on.
 * @param next - Express Next function to pass onto the next middleware.
 */
const parseBody = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  // Limit the body data size to 10mb so we don't crash the server.
  bodyParser.urlencoded({ limit: '10mb' });

  // List of URLs that require raw body (not parsed as JSON).
  const isWebhookUrl: boolean = ['/stripe/webhook'].includes(req.originalUrl);
  if (isWebhookUrl) return next();

  // Standard case, which parses the body as JSON.
  return bodyParser.json({ limit: '10mb' })(req, res, next);
};

export default parseBody;
