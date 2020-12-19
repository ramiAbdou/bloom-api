import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import mjml2html from 'mjml';

import { isProduction } from '@constants';
import sg from '@sendgrid/mail';
import logger from '@util/logger';

sg.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using the given MJML template and the data that is needed
 * to render the dynamic data.
 *
 * @param mjml Name of the MJML file (including the .mjml extension).
 * @param variables Optional variables that populate the Handlebars template.
 */
export const sendEmail = async (
  mjml: string,
  subject: string,
  to: string,
  data?: Record<string, any>
) => {
  // We shouldn't send any emails in production. If we do want to, we should
  // comment this line out manually each time.
  if (!isProduction) return;

  const pathToFile = `./src/core/emails/templates/${mjml}`;
  const template = compile(readFileSync(pathToFile, 'utf8'));
  const { html } = mjml2html(template(data));
  try {
    const options = { from: 'rami@bl.community', html, subject, to };
    await sg.send(options);
  } catch (e) {
    logger.log({
      error: `Failed to send SendGrid mail: ${e.stack}`,
      event: 'EMAIL_FAILED',
      level: 'ERROR'
    });
  }
};
