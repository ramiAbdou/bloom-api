/**
 * @fileoverview Utility: sendEmail
 * @author Rami Abdou
 */

import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import mjml2html from 'mjml';

import { SENDGRID } from '@constants';
import lg from '@lg';
import sg from '@sendgrid/mail';
import { EmailData, ValidateEmailData } from './types';

sg.setApiKey(SENDGRID.API_KEY);

/**
 * Sends an email to the
 *
 * @param mjml Name of the MJML file (including the .mjml extension).
 * @param variables Optional variables that populate the Handlebars template.
 */
const sendEmail = async (mjml: string, { to, subject, ...data }: EmailData) => {
  const pathToFile = `./src/core/emails/templates/${mjml}`;
  const template = compile(readFileSync(pathToFile, 'utf8'));
  const { html } = mjml2html(template(data));
  try {
    const options = { from: 'rami@bl.community', html, subject, to };
    await sg.send(options);
  } catch (e) {
    lg.error(`Failed to send SendGrid mail: ${e}`, { subject, to });
  }
};

export const sendValidationEmail = (data: ValidateEmailData) =>
  sendEmail('validate-email.mjml', {
    ...data,
    subject: `Welcome to Bloom! Confirm Your Email`
  });
