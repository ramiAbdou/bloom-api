/**
 * @fileoverview Utility: sendEmail
 * @author Rami Abdou
 */

import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import mjml2html from 'mjml';

import { isProduction } from '@constants';
import logger from '@logger';
import sg from '@sendgrid/mail';
import { EmailData, ValidateEmailData } from './types';

sg.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using the given MJML template and the data that is needed
 * to render the dynamic data.
 *
 * @param mjml Name of the MJML file (including the .mjml extension).
 * @param variables Optional variables that populate the Handlebars template.
 */
const sendEmail = async (mjml: string, { to, subject, ...data }: EmailData) => {
  // We shouldn't send any emails in production. If we do want to, we should
  // comment this line out manually each time.
  if (!isProduction) return;

  const pathToFile = `./src/util/emails/templates/${mjml}`;
  const template = compile(readFileSync(pathToFile, 'utf8'));
  const { html } = mjml2html(template(data));
  try {
    const options = { from: 'rami@bl.community', html, subject, to };
    await sg.send(options);
  } catch (e) {
    logger.error(`Failed to send SendGrid mail: ${e}`, { subject, to });
  }
};

export const sendVerificationEmail = (data: ValidateEmailData) =>
  sendEmail('verify-email.mjml', {
    ...data,
    subject: `Welcome to Bloom! Confirm Your Email`
  });
