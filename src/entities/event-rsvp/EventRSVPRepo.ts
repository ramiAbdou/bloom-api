/**
 * @fileoverview Repository: EventRSVP
 * @author Rami Abdou
 */

import { EntityRepository, Repository } from 'mikro-orm';

import EventRSVP from './EventRSVP';

@Repository(EventRSVP)
export default class EventRSVPRepo extends EntityRepository<EventRSVP> {}
