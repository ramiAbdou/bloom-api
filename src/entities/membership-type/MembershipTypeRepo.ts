/**
 * @fileoverview Repository: MembershipType
 * @author Rami Abdou
 */

import { EntityRepository, Repository } from 'mikro-orm';

import MembershipType from './MembershipType';

@entities/repository(MembershipType)
export default class MembershipTypeRepo extends EntityRepository<
  MembershipType
> {}
