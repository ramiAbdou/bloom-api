import { SendEmailsVars } from './emails.types';

interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

export const formatPersonalizations = (
  variables: SendEmailsVars[]
): FormatPersonalizationData[] => {
  return variables.map(({ email, ...vars }: SendEmailsVars) => {
    return { dynamicTemplateData: vars, to: { email } };
  });
};
