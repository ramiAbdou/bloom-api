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

CREATE TABLE public.event_invitees (
    id character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL,
    deleted_at character varying(255),
    updated_at character varying(255) NOT NULL,
    event_id character varying(255) NOT NULL,
    member_id character varying(255) NOT NULL
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
