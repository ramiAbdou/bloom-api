import { isProduction } from '@constants';
import sg, { MailDataRequired } from '@sendgrid/mail';
import logger from '@util/logger';
import { SendEmailsArgs } from './emails.types';
import {
  FormatPersonalizationData,
  processEmailPersonalizations
} from './processEmailPersonalizations';

interface SendEmailsBatch extends SendEmailsArgs {
  personalizations: FormatPersonalizationData[];
}

const sendEmailsBatch = async (args: SendEmailsBatch) => {
  const options: MailDataRequired = {
    from: { email: 'team@bl.community', name: 'Bloom' },
    personalizations: args.personalizations,
    templateId: process.env[`SENDGRID_${args.emailEvent}_TEMPLATE_ID`]
  };

  try {
    await sg.send(options);
  } catch (e) {
    logger.log({
      error: `Failed to send SendGrid mail: ${e.stack}`,
      level: 'ERROR'
    });
  }
};

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
  // if (!isProduction) return;

  const chunkedPersonalizations = await processEmailPersonalizations(args);

  await Promise.all(
    chunkedPersonalizations.map(
      async (personalizations: FormatPersonalizationData[]) => {
        await sendEmailsBatch({ ...args, personalizations });
      }
    )
  );
};

export default sendEmails;
