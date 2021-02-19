import { isProduction } from '@constants';
import sg, { MailDataRequired } from '@sendgrid/mail';
import { FlushEvent } from '@util/events';
import logger from '@util/logger';
import { SendEmailsArgs } from './emails.types';
import { formatPersonalizations } from './emails.util';

/**
 * Sends an email using the given MJML template and the data that is needed
 * to render the dynamic data.
 *
 * @param mjml Name of the MJML file (including the .mjml extension).
 * @param variables Optional variables that populate the Handlebars template.
 */
const sendEmails = async ({ template, variables }: SendEmailsArgs) => {
  // Shouldn't send any emails in development. If needed, comment this line
  // out manually each time.
  if (!isProduction) return;

  const options: MailDataRequired = {
    from: 'team@bl.community',
    personalizations: formatPersonalizations(variables),
    templateId: process.env[`SENDGRID_${template}_TEMPLATE_ID`]
  };

  try {
    await sg.send(options);
  } catch (e) {
    logger.log({
      error: `Failed to send SendGrid mail: ${e.stack}`,
      event: FlushEvent.EMAIL_FAILED,
      level: 'ERROR'
    });
  }
};

export default sendEmails;
