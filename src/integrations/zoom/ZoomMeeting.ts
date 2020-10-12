/**
 * @fileoverview Service: ZoomMeeting
 * @author Rami Abdou
 */

import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';

import { CreateZoomMeetingData, ZoomRecordingResponse } from './ZoomTypes';

export default class ZoomMeeting {
  meetingId: string;

  refreshToken: string; // Refresh token needed just in case.

  token: string; // Access token (Bearer) need to call the Zoom API.

  constructor(token: string, refreshToken: string, meetingId?: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    if (meetingId) this.meetingId = meetingId;
  }

  /**
   * Creates a Zoom meeting with the given Zoom options and returns the
   */
  createScheduledMeeting = async ({
    startTime,
    endTime,
    topic
  }: CreateZoomMeetingData): Promise<string> => {
    const body = {
      duration: moment(endTime).diff(moment(startTime), 'minutes'),
      start_time: startTime,
      topic,
      type: 2
    };

    const options: AxiosRequestConfig = {
      data: body,
      headers: { Authorization: `Bearer ${this.token}` },
      method: 'POST',
      url: 'https://api.zoom.us/v2/users/me/meetings'
    };

    return (await axios(options)).data.join_url;
  };

  /**
   * Returns the download link to the FIRST recording in the Zoom meeting.
   */
  getRecording = async (): Promise<string> => {
    const options: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${this.token}` },
      method: 'GET',
      url: `https://api.zoom.us/v2/meetings/${this.meetingId}/recordings`
    };

    const { recording_files: recordings } = (await axios(options))
      .data as ZoomRecordingResponse;

    return recordings.length ? recordings[0].download_url : null;
  };
}
