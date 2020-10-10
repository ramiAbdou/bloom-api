/**
 * @fileoverview Repository: Event
 * @author Rami Abdou
 */

import { EntityData } from 'mikro-orm';

import BaseRepo from '@util/db/BaseRepo';
import Event from './Event';

export default class EventRepo extends BaseRepo<Event> {
  createEvent = async (data: EntityData<Event>) => {
    const event: Event = this.createAndPersist(data);
    await this.flush('EVENT_CREATED', event);
  };
}
