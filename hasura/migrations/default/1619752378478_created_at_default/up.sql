ALTER TABLE applications ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE communities ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE event_attendees ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE event_guests ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE event_watches ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE events ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE member_refreshes ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE member_socials ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE member_types ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE member_values ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE members ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE questions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE ranked_questions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE supporters ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE tasks ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();