SET check_function_bodies = false;
CREATE TABLE public.members (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    bio text,
    email character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    joined_at character varying(255),
    picture_url character varying(255),
    role text,
    status text NOT NULL,
    community_id character varying(255) NOT NULL,
    member_type_id character varying(255),
    user_id character varying(255) NOT NULL,
    "position" character varying(255),
    CONSTRAINT members_role_check CHECK ((role = ANY (ARRAY['Admin'::text, 'Owner'::text]))),
    CONSTRAINT members_status_check CHECK ((status = ANY (ARRAY['Accepted'::text, 'Invited'::text, 'Pending'::text, 'Rejected'::text])))
);
CREATE FUNCTION public.member_full_name(member public.members) RETURNS text
    LANGUAGE sql STABLE
    AS $$
	SELECT member.first_name || ' ' || member.last_name
$$;
CREATE TABLE public.applications (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    description text NOT NULL,
    title character varying(255) NOT NULL,
    community_id character varying(255) NOT NULL
);
CREATE TABLE public.communities (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    auto_accept boolean NOT NULL,
    logo_url character varying(255),
    knowledge_hub_url character varying(255),
    name character varying(255) NOT NULL,
    primary_color character varying(255) NOT NULL,
    url_name character varying(255) NOT NULL,
    default_type_id character varying(255),
    highlighted_question_id character varying(255),
    owner_id character varying(255)
);
CREATE TABLE public.community_integrations (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    mailchimp_access_token character varying(255),
    mailchimp_list_id character varying(255),
    stripe_account_id character varying(255),
    zapier_api_key character varying(255),
    community_id character varying(255) NOT NULL
);
CREATE TABLE public.event_attendees (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    event_id character varying(255) NOT NULL,
    member_id character varying(255),
    supporter_id character varying(255)
);
CREATE TABLE public.event_guests (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    event_id character varying(255),
    member_id character varying(255),
    supporter_id character varying(255)
);
CREATE TABLE public.event_invitees (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    event_id character varying(255) NOT NULL,
    member_id character varying(255) NOT NULL
);
CREATE TABLE public.event_watches (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    event_id character varying(255) NOT NULL,
    member_id character varying(255) NOT NULL
);
CREATE TABLE public.events (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    description text NOT NULL,
    end_time character varying(255) NOT NULL,
    google_calendar_event_id character varying(255),
    image_url character varying(255),
    privacy text NOT NULL,
    recording_url character varying(255),
    start_time character varying(255) NOT NULL,
    summary character varying(255),
    title character varying(255) NOT NULL,
    video_url character varying(255) NOT NULL,
    community_id character varying(255) NOT NULL,
    CONSTRAINT events_privacy_check CHECK ((privacy = ANY (ARRAY['Members Only'::text, 'Open to All'::text])))
);
CREATE TABLE public.member_integrations (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    stripe_customer_id character varying(255),
    stripe_payment_method_id character varying(255),
    stripe_subscription_id character varying(255),
    member_id character varying(255) NOT NULL
);
CREATE TABLE public.member_refreshes (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    member_id character varying(255) NOT NULL
);
CREATE TABLE public.member_socials (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    facebook_url character varying(255),
    instagram_url character varying(255),
    linked_in_url character varying(255),
    twitter_url character varying(255),
    member_id character varying(255) NOT NULL
);
CREATE TABLE public.member_types (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    amount numeric NOT NULL,
    name character varying(255) NOT NULL,
    recurrence text NOT NULL,
    stripe_price_id character varying(255),
    stripe_product_id character varying(255),
    community_id character varying(255) NOT NULL,
    CONSTRAINT member_types_recurrence_check CHECK ((recurrence = ANY (ARRAY['Monthly'::text, 'Yearly'::text])))
);
CREATE TABLE public.member_values (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    value text,
    member_id character varying(255) NOT NULL,
    question_id character varying(255) NOT NULL
);
CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255),
    executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;
CREATE TABLE public.payments (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    amount numeric NOT NULL,
    type character varying(255) NOT NULL,
    stripe_invoice_id character varying(255) NOT NULL,
    stripe_invoice_url character varying(255) NOT NULL,
    community_id character varying(255) NOT NULL,
    member_id character varying(255) NOT NULL,
    member_type_id character varying(255) NOT NULL
);
CREATE TABLE public.questions (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    category text,
    description text,
    locked boolean NOT NULL,
    options text[],
    rank integer,
    required boolean NOT NULL,
    title character varying(255) NOT NULL,
    type text,
    community_id character varying(255) NOT NULL,
    CONSTRAINT questions_category_check CHECK ((category = ANY (ARRAY['BIO'::text, 'DUES_STATUS'::text, 'EMAIL'::text, 'EVENTS_ATTENDED'::text, 'FACEBOOK_URL'::text, 'FIRST_NAME'::text, 'GENDER'::text, 'INSTAGRAM_URL'::text, 'JOINED_AT'::text, 'LAST_NAME'::text, 'LINKED_IN_URL'::text, 'MEMBER_TYPE'::text, 'TWITTER_URL'::text]))),
    CONSTRAINT questions_type_check CHECK ((type = ANY (ARRAY['LONG_TEXT'::text, 'MULTIPLE_CHOICE'::text, 'MULTIPLE_SELECT'::text, 'SHORT_TEXT'::text])))
);
CREATE TABLE public.ranked_questions (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    rank integer,
    application_id character varying(255),
    question_id character varying(255) NOT NULL
);
CREATE TABLE public.supporters (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    community_id character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL
);
CREATE TABLE public.tasks (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    execute_at character varying(255) NOT NULL,
    event text NOT NULL,
    payload jsonb NOT NULL,
    CONSTRAINT tasks_event_check CHECK ((event = ANY (ARRAY['EVENT_REMINDER_1_DAY'::text, 'EVENT_REMINDER_1_HOUR'::text])))
);
CREATE TABLE public.users (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    google_id character varying(255),
    refresh_token text
);
ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_community_id_unique UNIQUE (community_id);
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_default_type_id_unique UNIQUE (default_type_id);
ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_highlighted_question_id_unique UNIQUE (highlighted_question_id);
ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_logo_url_unique UNIQUE (logo_url);
ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_owner_id_unique UNIQUE (owner_id);
ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_url_name_unique UNIQUE (url_name);
ALTER TABLE ONLY public.community_integrations
    ADD CONSTRAINT community_integrations_community_id_unique UNIQUE (community_id);
ALTER TABLE ONLY public.community_integrations
    ADD CONSTRAINT community_integrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_event_id_member_id_supporter_id_unique UNIQUE (event_id, member_id, supporter_id);
ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.event_guests
    ADD CONSTRAINT event_guests_event_id_member_id_supporter_id_unique UNIQUE (event_id, member_id, supporter_id);
ALTER TABLE ONLY public.event_guests
    ADD CONSTRAINT event_guests_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.event_invitees
    ADD CONSTRAINT event_invitees_event_id_member_id_unique UNIQUE (event_id, member_id);
ALTER TABLE ONLY public.event_invitees
    ADD CONSTRAINT event_invitees_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.event_watches
    ADD CONSTRAINT event_watches_event_id_member_id_unique UNIQUE (event_id, member_id);
ALTER TABLE ONLY public.event_watches
    ADD CONSTRAINT event_watches_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.member_integrations
    ADD CONSTRAINT member_integrations_member_id_unique UNIQUE (member_id);
ALTER TABLE ONLY public.member_integrations
    ADD CONSTRAINT member_integrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.member_refreshes
    ADD CONSTRAINT member_refreshes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.member_socials
    ADD CONSTRAINT member_socials_member_id_unique UNIQUE (member_id);
ALTER TABLE ONLY public.member_socials
    ADD CONSTRAINT member_socials_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.member_types
    ADD CONSTRAINT member_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.member_values
    ADD CONSTRAINT member_values_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_community_id_email_unique UNIQUE (community_id, email);
ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_invoice_id_unique UNIQUE (stripe_invoice_id);
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_invoice_url_unique UNIQUE (stripe_invoice_url);
ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.ranked_questions
    ADD CONSTRAINT ranked_questions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.ranked_questions
    ADD CONSTRAINT ranked_questions_question_id_unique UNIQUE (question_id);
ALTER TABLE ONLY public.supporters
    ADD CONSTRAINT supporters_community_id_email_unique UNIQUE (community_id, email);
ALTER TABLE ONLY public.supporters
    ADD CONSTRAINT supporters_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_unique UNIQUE (google_id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_refresh_token_unique UNIQUE (refresh_token);
CREATE INDEX member_values_idx ON public.member_values USING btree (member_id);
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_default_type_id_foreign FOREIGN KEY (default_type_id) REFERENCES public.member_types(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_highlighted_question_id_foreign FOREIGN KEY (highlighted_question_id) REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.community_integrations
    ADD CONSTRAINT community_integrations_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_member_id_foreign FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_supporter_id_foreign FOREIGN KEY (supporter_id) REFERENCES public.supporters(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.event_guests
    ADD CONSTRAINT event_guests_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.event_guests
    ADD CONSTRAINT event_guests_member_id_foreign FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.event_guests
    ADD CONSTRAINT event_guests_supporter_id_foreign FOREIGN KEY (supporter_id) REFERENCES public.supporters(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.event_invitees
    ADD CONSTRAINT event_invitees_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.event_invitees
    ADD CONSTRAINT event_invitees_member_id_foreign FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.event_watches
    ADD CONSTRAINT event_watches_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.event_watches
    ADD CONSTRAINT event_watches_member_id_foreign FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.member_integrations
    ADD CONSTRAINT member_integrations_member_id_foreign FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.member_refreshes
    ADD CONSTRAINT member_refreshes_member_id_foreign FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.member_socials
    ADD CONSTRAINT member_socials_member_id_foreign FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.member_types
    ADD CONSTRAINT member_types_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.member_values
    ADD CONSTRAINT member_values_member_id_foreign FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.member_values
    ADD CONSTRAINT member_values_question_id_foreign FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_member_type_id_foreign FOREIGN KEY (member_type_id) REFERENCES public.member_types(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_member_id_foreign FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_member_type_id_foreign FOREIGN KEY (member_type_id) REFERENCES public.member_types(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.ranked_questions
    ADD CONSTRAINT ranked_questions_application_id_foreign FOREIGN KEY (application_id) REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.ranked_questions
    ADD CONSTRAINT ranked_questions_question_id_foreign FOREIGN KEY (question_id) REFERENCES public.questions(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.supporters
    ADD CONSTRAINT supporters_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.supporters
    ADD CONSTRAINT supporters_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;
