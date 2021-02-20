import { isProduction } from '@constants';
import { FormatPersonalizationData } from './emails.types';

/**
 * Returns the formatted personalizations for a SendGrid email.
 *
 * @param variables Variables for an email template.
 */
const formatPersonalizations = (
  variables: any[]
): FormatPersonalizationData[] => {
  return variables
    .filter((args: any) => {
      if (isProduction) return true;
      return args.user.email === 'rami@bl.community';
    })
    .map((args: any) => {
      return { dynamicTemplateData: args, to: { email: args.user.email } };
    });
};

export default formatPersonalizations;
