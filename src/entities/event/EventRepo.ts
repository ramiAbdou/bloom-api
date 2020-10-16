/**
 * @fileoverview Repository: Event
 * @author Rami Abdou
 */

import { EntityData } from 'mikro-orm';

import { createScheduledMeeting } from '@integrations/zoom/ZoomUtil';
import BaseRepo from '@util/db/BaseRepo';
import Community from '../community/Community';
import Event from './Event';

export default class EventRepo extends BaseRepo<Event> {
  /**
   * Creates an event with the given data for the given community.
   *
   * Precondition: Either data must have a "zoomJoinUrl" or the community
   * must have a Zoom refreshToken stored in the DB.
   */
  createEvent = async (data: EntityData<Event>, communityId: string) => {
    const event: Event = this.createAndPersist(data);

    const { endTime, startTime, title, zoomJoinUrl } = data;

    // If no Zoom URL was specified, that means we need to create the Zoom
    // meeting ourselves using the community's Zoom account.
    if (!zoomJoinUrl) {
      // Try to refresh the Zoom tokens just in case they are expired.
      const {
        zoomAccessToken,
        zoomRefreshToken
      }: Community = await this.bm()
        .communityRepo()
        .refreshZoomTokens(communityId);

      const options = {
        startTime: startTime as string,
        topic: title as string
      };

      const { hostUrl, joinUrl } = await createScheduledMeeting({
        ...options,
        accessToken: zoomAccessToken
      });

      event.zoomJoinUrl = joinUrl;
    }

    await this.flush('EVENT_CREATED', event);
  };
}
