/**
 * @fileoverview Repository: Event
 * @author Rami Abdou
 */

import { EntityRepository } from 'mikro-orm';

import Event from './Event';

export default class EventRepo extends EntityRepository<Event> {}
