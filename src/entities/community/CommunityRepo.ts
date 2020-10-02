/**
 * @fileoverview Repository: Community
 * @author Rami Abdou
 */

import { EntityRepository, Repository } from 'mikro-orm';

import Community from './Community';

@entities/repository(Community)
export default class CommunityRepo extends EntityRepository<Community> {}
