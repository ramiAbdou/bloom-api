import { FormatPersonalizationData } from './emails.types';

/**
 * Returns the formatted personalizations for a SendGrid email.
 *
 * @param variables Variables for an email template.
 */
const formatPersonalizations = (
  variables: any[]
): FormatPersonalizationData[] => {
  return variables.map((args: any) => {
    return { dynamicTemplateData: args, to: { email: args.user.email } };
  });
};

export default formatPersonalizations;
