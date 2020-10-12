/**
 * @fileoverview Types: Google
 * @author Rami Abdou
 * @see https://marketplace.zoom.us/docs/api-reference/zoom-api
 */

/**
 * AUTH - Types pertaining to the OAuth2 flow for authentication.
 */

export type ZoomTokens = { accessToken: string; refreshToken: string };

/**
 * MEETING - Types pertaining to a Zoom Meeting.
 */

export type CreateZoomMeetingData = {
  endTime: string;
  startTime: string;
  topic: string;
};

export type ZoomRecordingResponse = {
  recording_files: { download_url: string }[];
};
