import { readFileSync } from 'fs';

import {
  EmailTemplate,
  PaymentReceiptVars,
  SendEmailsVars
} from './emails.types';

export const subjects: Record<EmailTemplate, (...args: any) => string> = {
  LOGIN_LINK: (): string => {
    return 'Your Bloom Login Link';
  },

  PAYMENT_RECEIPT: ({
    communityName
  }: Pick<PaymentReceiptVars, 'communityName'>): string => {
    return `${communityName} Membership Payment Invoice`;
  }
};

const templateFiles: Record<EmailTemplate, string> = {
  LOGIN_LINK: 'login-link',
  PAYMENT_RECEIPT: 'payment-receipt'
};

// ## FORMAT PERSONALIZATIONS

interface FormatPersonalizationsArgs {
  template: EmailTemplate;
  variables: SendEmailsVars[];
}

interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  subject: string;
  substitutions?: Record<string, any>;
  to: { email: string };
}

export const formatPersonalizations = ({
  template,
  variables
}: FormatPersonalizationsArgs): FormatPersonalizationData[] => {
  const subject: (...args: any) => string = subjects[template];

  return variables.map(({ email, ...vars }: SendEmailsVars) => {
    return {
      dynamicTemplateData: vars,
      subject: subject(vars),
      substitutions: vars,
      to: { email }
    };
  });
};

/**
 * Returns the Handlebars template of the email.
 *
 * @param template Email template used to get appropriate file name.
 */
export const getHandlebarsTemplate = (template: EmailTemplate): string => {
  const templateFileName = templateFiles[template];
  const pathToFile = `./src/core/emails/templates/${templateFileName}.mjml`;
  return readFileSync(pathToFile, 'utf8');
};
