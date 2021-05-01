CREATE
OR REPLACE FUNCTION get_members_with_event_interactions(event_id character varying(255), _limit INTEGER, _offset INTEGER, order_by character varying(255), order_direction character varying(255)) RETURNS
SETOF members AS $$ BEGIN RETURN QUERY
SELECT
  members.*
FROM
  (
    SELECT
      DISTINCT *
    FROM
      (
        SELECT
          event_attendees.created_at as event_attendees_created_at,
          NULL as event_guests_created_at,
          NULL as event_watches_created_at,
          members.*
        FROM
          event_attendees
          INNER JOIN members on event_attendees.member_id = members.id
        WHERE
          event_attendees.event_id = get_members_with_event_interactions.event_id
        UNION
        SELECT
          NULL as event_attendees_created_at,
          event_guests.created_at as event_guests_created_at,
          NULL as event_watches_created_at,
          members.*
        FROM
          event_guests
          INNER JOIN members on event_guests.member_id = members.id
        WHERE
          event_guests.event_id = get_members_with_event_interactions.event_id
        UNION
        SELECT
          NULL as event_attendees_created_at,
          NULL as event_guests_created_at,
          event_watches.created_at as event_watches_created_at,
          members.*
        FROM
          event_watches
          INNER JOIN members on event_watches.member_id = members.id
        WHERE
          event_watches.event_id = get_members_with_event_interactions.event_id
      ) as result1
  ) as result2
  INNER JOIN members on members.id = result2.id
ORDER BY
  (
    CASE WHEN order_by = 'event_attendees'
    AND order_direction = 'asc' THEN event_attendees_created_at END
  ) asc nulls last,
  (
    CASE WHEN order_by = 'event_attendees'
    AND order_direction = 'desc' THEN event_attendees_created_at END
  ) desc nulls last,
  (
    CASE WHEN order_by = 'event_guests'
    AND order_direction = 'asc' THEN event_guests_created_at END
  ) asc nulls last,
  (
    CASE WHEN order_by = 'event_guests'
    AND order_direction = 'desc' THEN event_guests_created_at END
  ) desc nulls last,
  (
    CASE WHEN order_by = 'event_watches'
    AND order_direction = 'asc' THEN event_watches_created_at END
  ) asc nulls last,
  (
    CASE WHEN order_by = 'event_watches'
    AND order_direction = 'desc' THEN event_watches_created_at END
  ) desc nulls last
OFFSET (_offset)
LIMIT (_limit);
END;
$$ language plpgsql STABLE;

