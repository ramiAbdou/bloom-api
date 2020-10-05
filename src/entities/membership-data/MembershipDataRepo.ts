/**
 * @fileoverview Repository: MembershipData
 * @author Rami Abdou
 */

import * as CSV from 'csv-string';
import { EntityData } from 'mikro-orm';

import BaseRepo from '@util/db/BaseRepo';
import MembershipData from './MembershipData';

export default class MembershipDataRepo extends BaseRepo<MembershipData> {
  createData = async ({ value, ...data }: EntityData<MembershipData>) => {
    // If the value is a string, and there's some commas in the value, then
    // split the value into an array and CSV stringify it. If the value is an
    // array, then we just need to stringify it.
    if (typeof value === 'string' && value.includes(','))
      value = CSV.stringify(value.split(','));
    else if (Array.isArray(value)) value = CSV.stringify(value);
    return this.createAndPersist({ ...data, value });
  };
}
