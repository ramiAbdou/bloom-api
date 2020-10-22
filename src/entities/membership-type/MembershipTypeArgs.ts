/**
 * @fileoverview Entity: MembershipType
 * @author Rami Abdou
 */

import MembershipType, { MembershipTypeRecurrence } from './MembershipType';

// Note that for InputType, we still have to had the "?" for fields that have
// a default value in order to run scripts without type errors.

export class MembershipTypeInput implements Partial<MembershipType> {
  amount?: number = 0.0;

  isDefault?: boolean = false;

  recurrence?: MembershipTypeRecurrence = 'LIFETIME';

  name: string;
}
