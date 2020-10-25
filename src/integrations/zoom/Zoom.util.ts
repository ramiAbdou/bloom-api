/**
 * @fileoverview Service: ZoomAuth
 * @author Rami Abdou
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import camelCase from 'camelcase-keys';
import snakeCase from 'snakecase-keys';

import { APP, AuthTokens } from '@constants';

/**
 * Returns the accessToken and refreshToken from the data.
 * Precondition: data has both an access_token and refresh_token.
 *
 * @example extractTokensFromAxios(
 *  { data: { access_token: 'a', refresh_token: 'b' } }
 * ) => { accessToken: 'a', refreshToken: 'b' }
 */
const extractTokensFromAxios = ({ data }: AxiosResponse): AuthTokens => ({
  accessToken: data.access_token,
  refreshToken: data.refresh_token
});

/**
 *
 * AUTHENTICATION - Handles OAuth2 authentication flow, including token
 * exchange for code as well as refreshing.
 *
 */

const base64Token = Buffer.from(
  `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
).toString('base64');

const authOptions: AxiosRequestConfig = {
  headers: { Authorization: `Basic ${base64Token}` },
  method: 'POST',
  url: 'https://zoom.us/oauth/token'
};

/**
 * Exchanges the given code for an access and refresh token from the Zoom API.
 *
 * @param code Code from authorization callback that we need to exchange for
 * a token from the Google API.
 */
export const getTokensFromCode = async (code: string): Promise<AuthTokens> => {
  const options: AxiosRequestConfig = {
    ...authOptions,
    params: {
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${APP.SERVER_URL}/zoom/auth`
    }
  };

  const response = await axios(options);
  return extractTokensFromAxios(response);
};

/**
 * Returns the accessToken and refreshToken after refreshing the token with the
 * Zoom API.
 *
 * Precondition: @param refreshToken must be a valid Zoom API refresh token.
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthTokens> => {
  const options: AxiosRequestConfig = {
    ...authOptions,
    params: { grant_type: 'refresh_token', refresh_token: refreshToken }
  };

  try {
    const response = await axios(options);
    return extractTokensFromAxios(response);
  } catch {
    return { accessToken: null, refreshToken: null };
  }
};

/**
 *
 * MEETINGS - Handles the creation, updating and deleting of Zoom meetings.
 *
 */

const meetingOptions: AxiosRequestConfig = {
  method: 'POST',
  url: 'https://api.zoom.us/v2/users/me/meetings'
};

type MeetingOptions = { duration?: number; startTime: string; topic?: string };
type ZoomAccessToken = { accessToken: string };
interface MeetingData extends MeetingOptions, ZoomAccessToken {}
type ZoomURLs = { joinUrl: string; hostUrl: string };

/**
 * Returns a snake-cased version of the Zoom Meeting data. If any optional
 * values are non-null, then we add that to the data. Makes the data dynamic for
 * submission to Zoom API.
 */
const parseMeetingData = ({ duration, startTime, topic }: MeetingOptions) =>
  snakeCase({
    ...(duration ? { duration } : {}),
    ...(startTime ? { startTime } : {}),
    ...(topic ? { topic } : {}),
    type: 2
  });

/**
 * Creates a scheduled Zoom meeting with the given meeting options. Returns the
 * join URL and the start URL (for the host).
 *
 */
export const createScheduledMeeting = async ({
  accessToken,
  ...meetingData
}: MeetingData): Promise<ZoomURLs> => {
  const options: AxiosRequestConfig = {
    ...meetingOptions,
    data: parseMeetingData(meetingData),
    headers: { Authorization: `Bearer ${accessToken}` }
  };

  const { data } = await axios(options);
  return camelCase(data);
};

/**
 *
 * RECORDINGS - Handles the downloading of Zoom recordings.
 *
 */

type RecordingOptions = { meetingId: number };
interface RecordingData extends RecordingOptions, ZoomAccessToken {}

/**
 * Returns the download link to the FIRST recording in the Zoom meeting.
 */
export const getRecording = async ({
  accessToken,
  meetingId
}: RecordingData): Promise<string> => {
  const options: AxiosRequestConfig = {
    headers: { Authorization: `Bearer ${accessToken}` },
    method: 'GET',
    url: `https://api.zoom.us/v2/meetings/${meetingId}/recordings`
  };

  const { data } = await axios(options);
  return data?.recording_files[0]?.download_url;
};
