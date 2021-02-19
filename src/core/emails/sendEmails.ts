import mjml2html from 'mjml';
import path from 'path';

import { FlushEvent, isProduction } from '@constants';
import sg, { MailDataRequired } from '@sendgrid/mail';
import logger from '@util/logger';
import { SendEmailsArgs } from './emails.types';
import { formatPersonalizations, getHandlebarsTemplate } from './emails.util';

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
  // if (!isProduction) return;

  const handlebarsTemplate = getHandlebarsTemplate(template);

  const { html } = mjml2html(handlebarsTemplate, {
    // Needed to use mj-include with relative paths.
    filePath: path.join(__dirname, 'templates')
  });

  console.log(html);
  console.log(formatPersonalizations({ template, variables }));

  try {
    const options: MailDataRequired = {
      from: 'rami@bl.community',
      html,
      personalizations: formatPersonalizations({ template, variables })
    };

    await sg.send(options);
  } catch (e) {
    logger.log({
      // error: `Failed to send SendGrid mail to ${to}: ${e.stack}`,
      event: FlushEvent.EMAIL_FAILED,
      level: 'ERROR'
    });
  }
};

export default sendEmails;
