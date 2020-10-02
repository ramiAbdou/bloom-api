/**
 * @fileoverview Repository: User
 * @author Rami Abdou
 */

import { EntityRepository, Repository } from 'mikro-orm';

import User from './User';

@entities/repository(User)
export default class UserRepo extends EntityRepository<User> {}
