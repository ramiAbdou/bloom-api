-- Inserts 2 records into the tasks table with the event being
-- EVENT_REMINDER_1_DAY and EVENT_REMINDER_1_HOUR. To calculate the
-- execute_at timestamp, we subtract 1 day and 1 hour off of the start_time
-- of the newly created event.

CREATE OR REPLACE FUNCTION create_event_tasks() RETURNS TRIGGER as $$
  BEGIN
    INSERT INTO tasks (execute_at, event, payload) VALUES (NEW.start_time::DATE - INTERVAL '1 DAY', 'EVENT_REMINDER_1_DAY', ('{ "eventId": "' || NEW.id || '" }'::TEXT)::jsonb);
    INSERT INTO tasks (execute_at, event, payload) VALUES (NEW.start_time::DATE - INTERVAL '1 HOUR', 'EVENT_REMINDER_1_HOUR', ('{ "eventId": "' || NEW.id || '" }'::TEXT)::jsonb);
    RETURN NEW;
  END
$$ LANGUAGE plpgsql;

-- Trigger on events after creation.

CREATE TRIGGER events_create_reminders AFTER
INSERT ON events
FOR EACH ROW EXECUTE PROCEDURE create_event_tasks();

