import { google } from 'googleapis';

import googleConfig from '../../../google.json';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const googleClient = new google.auth.JWT(
  googleConfig.client_email,
  null,
  googleConfig.private_key,
  SCOPES,
  'team@onbloom.co'
);

// In the future, could have other Service Account calendar (eg: Meetups, etc)
// but this calendar is only for Bloom customers' events.
export const eventsCalendar = google.calendar({
  auth: googleClient,
  version: 'v3'
});
