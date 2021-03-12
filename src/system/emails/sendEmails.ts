import sg, { MailDataRequired } from '@sendgrid/mail';
import logger from '@system/logger/logger';
import { isDevelopment } from '@util/constants';
import { EmailArgs } from './emails.types';
import getPersonalizations, {
  FormatPersonalizationData
} from './getPersonalizations';
import getTemplateId from './getTemplateId';

interface SendEmailsBatch extends EmailArgs {
  personalizations: FormatPersonalizationData[];
}

const sendEmailsBatch = async (args: SendEmailsBatch) => {
  const templateId: string = getTemplateId(args.emailEvent);

  const options: MailDataRequired = {
    from: { email: 'team@onbloom.co', name: 'Bloom' },
    personalizations: args.personalizations,
    templateId
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
const sendEmails = async (args: EmailArgs) => {
  // Shouldn't send any emails in development. If needed, comment this line
  // out manually each time.
  if (isDevelopment) return;

  const chunkedPersonalizations = await getPersonalizations(args);

  if (!chunkedPersonalizations[0]?.length) return;

  await Promise.all(
    chunkedPersonalizations.map(
      async (personalizations: FormatPersonalizationData[]) => {
        await sendEmailsBatch({ ...args, personalizations });
      }
    )
  );
};

export default sendEmails;
