import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import mjml2html from 'mjml';
import path from 'path';

import { FlushEvent, isProduction } from '@constants';
import sg from '@sendgrid/mail';
import logger from '@util/logger';
import { emailSubjectFns, emailTemplateFiles, SendEmailArgs } from './types';

sg.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using the given MJML template and the data that is needed
 * to render the dynamic data.
 *
 * @param mjml Name of the MJML file (including the .mjml extension).
 * @param variables Optional variables that populate the Handlebars template.
 */
const sendEmail = async ({ template, to, variables }: SendEmailArgs) => {
  // Shouldn't send any emails in development. If needed, comment this line
  // out manually each time.
  if (!isProduction) return;

  const templateFileName = emailTemplateFiles[template];
  const pathToFile = `./src/core/emails/templates/${templateFileName}.mjml`;
  const hbsTemplate = compile(readFileSync(pathToFile, 'utf8'));

  const { html } = mjml2html(hbsTemplate(variables), {
    // Needed to use mj-include with relative paths.
    filePath: path.join(__dirname, 'templates')
  });

  try {
    const options = {
      from: 'rami@bl.community',
      html,
      subject: emailSubjectFns[template](variables),
      to
    };

    await sg.send(options);
  } catch (e) {
    logger.log({
      error: `Failed to send SendGrid mail to ${to}: ${e.stack}`,
      event: FlushEvent.EMAIL_FAILED,
      level: 'ERROR'
    });
  }
};

export default sendEmail;
