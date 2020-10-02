/**
 * @fileoverview Repository: Membership
 * @author Rami Abdou
 */

import { EntityRepository, Repository } from 'mikro-orm';

import Membership from './Membership';

@Repository(Membership)
export default class MembershipRepo extends EntityRepository<Membership> {}
