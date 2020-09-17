/**
 * @fileoverview Repository: User
 * @author Rami Abdou
 */

import { EntityRepository, Repository } from 'mikro-orm';

import User from './User';

@Repository(User)
export default class UserRepo extends EntityRepository<User> {}
