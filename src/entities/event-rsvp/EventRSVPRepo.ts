/**
 * @fileoverview Repository: EventRSVP
 * @author Rami Abdou
 */

import { EntityRepository } from 'mikro-orm';

import EventRSVP from './EventRSVP';

export default class EventRSVPRepo extends EntityRepository<EventRSVP> {}
