CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER as $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_applications_timestamp BEFORE UPDATE
ON applications FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_communities_timestamp BEFORE UPDATE
ON communities FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_event_attendees_timestamp BEFORE UPDATE
ON event_attendees FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_event_guests_timestamp BEFORE UPDATE
ON event_guests FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_event_watches_timestamp BEFORE UPDATE
ON event_watches FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_events_timestamp BEFORE UPDATE
ON events FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_member_refreshes_timestamp BEFORE UPDATE
ON member_refreshes FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_member_socials_timestamp BEFORE UPDATE
ON member_socials FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_member_types_timestamp BEFORE UPDATE
ON member_types FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_member_values_timestamp BEFORE UPDATE
ON member_values FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_members_timestamp BEFORE UPDATE
ON members FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_questions_timestamp BEFORE UPDATE
ON questions FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_ranked_questions_timestamp BEFORE UPDATE
ON ranked_questions FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_supporters_timestamp BEFORE UPDATE
ON supporters FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_tasks_timestamp BEFORE UPDATE
ON tasks FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TRIGGER update_users_timestamp BEFORE UPDATE
ON users FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();
