/**
 * @fileoverview Repository: Event
 * @author Rami Abdou
 */

import { EntityRepository, Repository } from 'mikro-orm';

import Event from './Event';

@Repository(Event)
export default class EventRepo extends EntityRepository<Event> {}
