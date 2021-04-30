DROP TRIGGER IF EXISTS applications_update_timestamp on applications;
DROP TRIGGER IF EXISTS communities_update_timestamp on communities;
DROP TRIGGER IF EXISTS event_attendees_update_timestamp on event_attendees;
DROP TRIGGER IF EXISTS event_guests_update_timestamp on event_guests;
DROP TRIGGER IF EXISTS event_watches_update_timestamp on event_watches;
DROP TRIGGER IF EXISTS events_update_timestamp on events;
DROP TRIGGER IF EXISTS member_refreshes_update_timestamp on member_refreshes;
DROP TRIGGER IF EXISTS member_socials_update_timestamp on member_socials;
DROP TRIGGER IF EXISTS member_types_update_timestamp on member_types;
DROP TRIGGER IF EXISTS member_values_update_timestamp on member_values;
DROP TRIGGER IF EXISTS members_update_timestamp on members;
DROP TRIGGER IF EXISTS questions_update_timestamp on questions;
DROP TRIGGER IF EXISTS ranked_questions_update_timestamp on ranked_questions;
DROP TRIGGER IF EXISTS supporters_update_timestamp on supporters;
DROP TRIGGER IF EXISTS tasks_update_timestamp on tasks;
DROP TRIGGER IF EXISTS users_update_timestamp on users;

DROP FUNCTION IF EXISTS update_timestamp;
