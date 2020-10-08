/**
 * @fileoverview Service: ZoomMeeting
 * @author Rami Abdou
 */

import axios, { AxiosRequestConfig } from 'axios';

import { ZoomRecordingResponse } from './ZoomTypes';

export default class ZoomMeeting {
  // Access token (Bearer) need to call the Zoom API.
  meetingId: string;

  // Access token (Bearer) need to call the Zoom API.
  token: string;

  constructor(token: string, meetingId?: string) {
    this.token = token;
    if (meetingId) this.meetingId = meetingId;
  }

  /**
   * Creates a Zoom meeting with the given Zoom options and returns the
   */
  createMeeting = async () => {};

  /**
   * Returns the download link to the FIRST recording in the Zoom meeting.
   */
  getRecording = async () => {
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
