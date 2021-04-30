CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER as $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER applications_update_timestamp BEFORE UPDATE
ON applications FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER communities_update_timestamp BEFORE UPDATE
ON communities FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER event_attendees_update_timestamp BEFORE UPDATE
ON event_attendees FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER event_guests_update_timestamp BEFORE UPDATE
ON event_guests FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER event_watches_update_timestamp BEFORE UPDATE
ON event_watches FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER events_update_timestamp BEFORE UPDATE
ON events FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER member_refreshes_update_timestamp BEFORE UPDATE
ON member_refreshes FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER member_socials_update_timestamp BEFORE UPDATE
ON member_socials FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER member_types_update_timestamp BEFORE UPDATE
ON member_types FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER member_values_update_timestamp BEFORE UPDATE
ON member_values FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER members_update_timestamp BEFORE UPDATE
ON members FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER questions_update_timestamp BEFORE UPDATE
ON questions FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER ranked_questions_update_timestamp BEFORE UPDATE
ON ranked_questions FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER supporters_update_timestamp BEFORE UPDATE
ON supporters FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER tasks_update_timestamp BEFORE UPDATE
ON tasks FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER users_update_timestamp BEFORE UPDATE
ON users FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();
