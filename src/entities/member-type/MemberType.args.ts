import MemberType from './MemberType';

// Note that for InputType, we still have to had the "?" for fields that have
// a default value in order to run scripts without type errors.

export class MemberTypeInput implements Partial<MemberType> {
  amount?: number = 0.0;

  isDefault?: boolean = false;

  name: string;
}
