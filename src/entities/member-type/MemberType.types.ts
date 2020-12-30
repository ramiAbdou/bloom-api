import MemberType from './MemberType';

export enum RecurrenceType {
  LIFETIME = 'LIFETIME',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

// Note that for InputType, we still have to had the "?" for fields that have
// a default value in order to run scripts without type errors.

export interface MemberTypeInput extends Partial<MemberType> {
  isDefault?: boolean;
  name: string;
}
