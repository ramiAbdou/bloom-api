/**
 * @fileoverview Types: Google
 * @author Rami Abdou
 * @see https://marketplace.zoom.us/docs/api-reference/zoom-api
 */

/**
 * AUTH - Types pertaining to the OAuth2 flow for authentication.
 */

export type ZoomTokens = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

/**
 * MEETING - Types pertaining to a Zoom Meeting.
 */

export type ZoomMeetingRequest = {
  topic: string;
  type: number; // 1: Instant, 2: Scheduled, 3: Recurring, 8: Recurring w/ Time
  start_time: number; // 1: Instant, 2: Scheduled, 3: Recurring, 8: Recurring w/ Time
};

export type ZoomRecordingResponse = {
  recording_files: { download_url: string }[];
};
