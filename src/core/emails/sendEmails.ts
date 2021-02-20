import { isProduction } from '@constants';
import sg, { MailDataRequired } from '@sendgrid/mail';
import { MiscEvent } from '@util/events';
import logger from '@util/logger';
import { SendEmailsArgs } from './emails.types';
import prepareEmailPersonalizations from './prepareEmailPersonalizations';

/**
 * Sends an email using the given MJML template and the data that is needed
 * to render the dynamic data.
 *
 * @param mjml Name of the MJML file (including the .mjml extension).
 * @param variables Optional variables that populate the Handlebars template.
 */
const sendEmails = async (args: SendEmailsArgs) => {
  // Shouldn't send any emails in development. If needed, comment this line
  // out manually each time.
  if (!isProduction) return;

  const personalizations = await prepareEmailPersonalizations(args);

  const options: MailDataRequired = {
    from: 'team@bl.community',
    personalizations,
    templateId: process.env[`SENDGRID_${args.emailEvent}_TEMPLATE_ID`]
  };

  try {
    await sg.send(options);
  } catch (e) {
    logger.log({
      error: `Failed to send SendGrid mail: ${e.stack}`,
      event: MiscEvent.EMAIL_FAILED,
      level: 'ERROR'
    });
  }
};

export default sendEmails;
