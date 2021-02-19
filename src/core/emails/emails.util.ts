import { SendEmailsVars } from './emails.types';

interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

/**
 * Returns the formatted personalizations for a SendGrid email.
 *
 * @param variables Variables for an email template.
 */
export const formatPersonalizations = (
  variables: SendEmailsVars[]
): FormatPersonalizationData[] => {
  return variables.map((args: SendEmailsVars) => {
    return { dynamicTemplateData: args, to: { email: args.user.email } };
  });
};
