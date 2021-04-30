CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE or REPLACE FUNCTION nanoid()
RETURNS TRIGGER AS $$

DECLARE
  key TEXT;
  query TEXT;
  found TEXT;

BEGIN

  -- Generates the first part of a query as a string with safel escaped
  -- table name, using || to concat the parts.
  query := 'SELECT id FROM ' || quote_ident(TG_TABLE_NAME) || ' WHERE id=';

  -- Should only run once per call, until we've generated millions of IDs and
  -- there is a greater chance of collision.
  LOOP
    key := encode(gen_random_bytes(6), 'base64');

    -- Base64 encoding contains 2 URL unsafe characters by default.
    -- The URL-safe version has these replacements.
    key := replace(key, '/', '_');
    key := replace(key, '+', '-');

    -- Concat the generated key (safely quoted) with the generated query
    -- and run it.
    -- SELECT id FROM "test" WHERE id='blahblah' INTO found
    -- Now "found" will be the duplicated id or NULL.
    EXECUTE query || quote_literal(key) INTO found;

    -- Check to see if found is NULL.
    -- If we checked to see if found = NULL it would always be FALSE
    -- because (NULL = NULL) is always FALSE.
    IF found IS NULL THEN
      -- If no collision, then no worries, leave the LOOP.
      EXIT;
    END IF;

    -- We haven't EXITed yet, so return to the top of the LOOP
    -- and try again.
  END LOOP;

  -- NEW and OLD are available in TRIGGER PROCEDURES.
  -- NEW is the mutated row that will actually be INSERTed.
  -- We're replacing id, regardless of what it was before
  -- with our key variable.
  NEW.id = key;

  return NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER applications_gen_id BEFORE INSERT
ON applications FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER communities_gen_id BEFORE INSERT
ON communities FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER event_attendees_gen_id BEFORE INSERT
ON event_attendees FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER event_guests_gen_id BEFORE INSERT
ON event_guests FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER event_watches_gen_id BEFORE INSERT
ON event_watches FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER events_gen_id BEFORE INSERT
ON events FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER member_refreshes_gen_id BEFORE INSERT
ON member_refreshes FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER member_socials_gen_id BEFORE INSERT
ON member_socials FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER member_types_gen_id BEFORE INSERT
ON member_types FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER member_values_gen_id BEFORE INSERT
ON member_values FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER members_gen_id BEFORE INSERT
ON members FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER questions_gen_id BEFORE INSERT
ON questions FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER ranked_questions_gen_id BEFORE INSERT
ON ranked_questions FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER supporters_gen_id BEFORE INSERT
ON supporters FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER tasks_gen_id BEFORE INSERT
ON tasks FOR EACH ROW EXECUTE PROCEDURE
nanoid();

CREATE TRIGGER users_gen_id BEFORE INSERT
ON users FOR EACH ROW EXECUTE PROCEDURE
nanoid();
