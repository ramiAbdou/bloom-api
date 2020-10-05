/**
 * @fileoverview Types: Email
 * @author Rami Abdou
 */

type BasicEmailData = { mjml: string; to: string; subject?: string };

export interface ValidateEmailData extends BasicEmailData {
  verificationUrl: string;
}

export type EmailData = BasicEmailData | ValidateEmailData;
