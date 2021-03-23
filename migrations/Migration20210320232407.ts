import { Migration } from '@mikro-orm/migrations';

export class Migration20210320232407 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "users" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "email" varchar(255) not null, "google_id" varchar(255) null, "refresh_token" text null);'
    );

    this.addSql(
      'alter table "users" add constraint "users_pkey" primary key ("id");'
    );

    this.addSql(
      'alter table "users" add constraint "users_email_unique" unique ("email");'
    );

    this.addSql(
      'alter table "users" add constraint "users_google_id_unique" unique ("google_id");'
    );

    this.addSql(
      'alter table "users" add constraint "users_refresh_token_unique" unique ("refresh_token");'
    );

    this.addSql(
      'create table "tasks" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "execute_at" varchar(255) not null, "event" text check ("event" in (\'EVENT_REMINDER_1_DAY\', \'EVENT_REMINDER_1_HOUR\')) not null, "payload" jsonb not null);'
    );

    this.addSql(
      'alter table "tasks" add constraint "tasks_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "communities" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "auto_accept" bool not null, "logo_url" varchar(255) null, "knowledge_hub_url" varchar(255) null, "name" varchar(255) not null, "primary_color" varchar(255) not null, "url_name" varchar(255) not null, "default_type_id" varchar(255) null, "highlighted_question_id" varchar(255) null, "owner_id" varchar(255) null);'
    );

    this.addSql(
      'alter table "communities" add constraint "communities_pkey" primary key ("id");'
    );

    this.addSql(
      'alter table "communities" add constraint "communities_logo_url_unique" unique ("logo_url");'
    );

    this.addSql(
      'alter table "communities" add constraint "communities_url_name_unique" unique ("url_name");'
    );

    this.addSql(
      'alter table "communities" add constraint "communities_default_type_id_unique" unique ("default_type_id");'
    );

    this.addSql(
      'alter table "communities" add constraint "communities_highlighted_question_id_unique" unique ("highlighted_question_id");'
    );

    this.addSql(
      'alter table "communities" add constraint "communities_owner_id_unique" unique ("owner_id");'
    );

    this.addSql(
      'create table "events" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "description" text not null, "end_time" varchar(255) not null, "google_calendar_event_id" varchar(255) null, "image_url" varchar(255) null, "privacy" text check ("privacy" in (\'Members Only\', \'Open to All\')) not null, "recording_url" varchar(255) null, "start_time" varchar(255) not null, "summary" varchar(255) null, "title" varchar(255) not null, "video_url" varchar(255) not null, "community_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "events" add constraint "events_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "member_plans" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "amount" decimal not null, "name" varchar(255) not null, "recurrence" text check ("recurrence" in (\'Monthly\', \'Yearly\')) not null, "stripe_price_id" varchar(255) null, "stripe_product_id" varchar(255) null, "community_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "member_plans" add constraint "member_plans_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "members" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "bio" text null, "email" varchar(255) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "joined_at" varchar(255) null, "picture_url" varchar(255) null, "role" text check ("role" in (\'Admin\', \'Owner\')) null, "status" text check ("status" in (\'Accepted\', \'Invited\', \'Pending\', \'Rejected\')) not null, "community_id" varchar(255) not null, "plan_id" varchar(255) null, "user_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "members" add constraint "members_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "event_invitees" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "event_id" varchar(255) not null, "member_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "event_invitees" add constraint "event_invitees_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "event_watches" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "event_id" varchar(255) not null, "member_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "event_watches" add constraint "event_watches_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "payments" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "amount" decimal not null, "type" varchar(255) not null, "stripe_invoice_id" varchar(255) not null, "stripe_invoice_url" varchar(255) not null, "community_id" varchar(255) not null, "member_id" varchar(255) not null, "plan_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "payments" add constraint "payments_pkey" primary key ("id");'
    );

    this.addSql(
      'alter table "payments" add constraint "payments_stripe_invoice_id_unique" unique ("stripe_invoice_id");'
    );

    this.addSql(
      'alter table "payments" add constraint "payments_stripe_invoice_url_unique" unique ("stripe_invoice_url");'
    );

    this.addSql(
      'create table "member_integrations" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "stripe_customer_id" varchar(255) null, "stripe_payment_method_id" varchar(255) null, "stripe_subscription_id" varchar(255) null, "member_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "member_integrations" add constraint "member_integrations_pkey" primary key ("id");'
    );

    this.addSql(
      'alter table "member_integrations" add constraint "member_integrations_member_id_unique" unique ("member_id");'
    );

    this.addSql(
      'create table "member_refreshes" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "member_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "member_refreshes" add constraint "member_refreshes_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "member_socials" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "clubhouse_url" varchar(255) null, "facebook_url" varchar(255) null, "instagram_url" varchar(255) null, "linked_in_url" varchar(255) null, "twitter_url" varchar(255) null, "member_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "member_socials" add constraint "member_socials_pkey" primary key ("id");'
    );

    this.addSql(
      'alter table "member_socials" add constraint "member_socials_member_id_unique" unique ("member_id");'
    );

    this.addSql(
      "create table \"questions\" (\"id\" varchar(255) not null, \"created_at\" varchar(255) not null, \"deleted_at\" varchar(255) null, \"updated_at\" varchar(255) not null, \"category\" text check (\"category\" in ('BIO', 'CLUBHOUSE_URL', 'DUES_STATUS', 'EMAIL', 'EVENTS_ATTENDED', 'FACEBOOK_URL', 'FIRST_NAME', 'GENDER', 'INSTAGRAM_URL', 'JOINED_AT', 'LAST_NAME', 'LINKED_IN_URL', 'MEMBER_PLAN', 'TWITTER_URL')) null, \"description\" text null, \"locked\" bool not null, \"options\" text[] null, \"rank\" int4 null, \"required\" bool not null, \"title\" varchar(255) not null, \"type\" text check (\"type\" in ('LONG_TEXT', 'MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'SHORT_TEXT')) null, \"community_id\" varchar(255) not null);"
    );

    this.addSql(
      'alter table "questions" add constraint "questions_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "member_values" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "value" text null, "member_id" varchar(255) not null, "question_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "member_values" add constraint "member_values_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "supporters" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "email" varchar(255) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "community_id" varchar(255) not null, "user_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "supporters" add constraint "supporters_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "event_attendees" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "event_id" varchar(255) not null, "member_id" varchar(255) null, "supporter_id" varchar(255) null);'
    );

    this.addSql(
      'alter table "event_attendees" add constraint "event_attendees_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "event_guests" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "event_id" varchar(255) null, "member_id" varchar(255) null, "supporter_id" varchar(255) null);'
    );

    this.addSql(
      'alter table "event_guests" add constraint "event_guests_pkey" primary key ("id");'
    );

    this.addSql(
      'create table "community_integrations" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "mailchimp_access_token" varchar(255) null, "mailchimp_list_id" varchar(255) null, "stripe_account_id" varchar(255) null, "zapier_api_key" varchar(255) null, "community_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "community_integrations" add constraint "community_integrations_pkey" primary key ("id");'
    );

    this.addSql(
      'alter table "community_integrations" add constraint "community_integrations_community_id_unique" unique ("community_id");'
    );

    this.addSql(
      'create table "applications" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "description" text not null, "title" varchar(255) not null, "community_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "applications" add constraint "applications_pkey" primary key ("id");'
    );

    this.addSql(
      'alter table "applications" add constraint "applications_community_id_unique" unique ("community_id");'
    );

    this.addSql(
      'create table "ranked_questions" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "rank" int4 null, "application_id" varchar(255) null, "question_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "ranked_questions" add constraint "ranked_questions_pkey" primary key ("id");'
    );

    this.addSql(
      'alter table "ranked_questions" add constraint "ranked_questions_question_id_unique" unique ("question_id");'
    );

    this.addSql(
      'alter table "communities" add constraint "communities_default_type_id_foreign" foreign key ("default_type_id") references "member_plans" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "communities" add constraint "communities_highlighted_question_id_foreign" foreign key ("highlighted_question_id") references "questions" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "communities" add constraint "communities_owner_id_foreign" foreign key ("owner_id") references "members" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "events" add constraint "events_community_id_foreign" foreign key ("community_id") references "communities" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "member_plans" add constraint "member_plans_community_id_foreign" foreign key ("community_id") references "communities" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "members" add constraint "members_community_id_foreign" foreign key ("community_id") references "communities" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "members" add constraint "members_plan_id_foreign" foreign key ("plan_id") references "member_plans" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "members" add constraint "members_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "event_invitees" add constraint "event_invitees_event_id_foreign" foreign key ("event_id") references "events" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "event_invitees" add constraint "event_invitees_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "event_watches" add constraint "event_watches_event_id_foreign" foreign key ("event_id") references "events" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "event_watches" add constraint "event_watches_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "payments" add constraint "payments_community_id_foreign" foreign key ("community_id") references "communities" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "payments" add constraint "payments_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "payments" add constraint "payments_plan_id_foreign" foreign key ("plan_id") references "member_plans" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "member_integrations" add constraint "member_integrations_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "member_refreshes" add constraint "member_refreshes_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "member_socials" add constraint "member_socials_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "questions" add constraint "questions_community_id_foreign" foreign key ("community_id") references "communities" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "member_values" add constraint "member_values_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "member_values" add constraint "member_values_question_id_foreign" foreign key ("question_id") references "questions" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "supporters" add constraint "supporters_community_id_foreign" foreign key ("community_id") references "communities" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "supporters" add constraint "supporters_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "event_attendees" add constraint "event_attendees_event_id_foreign" foreign key ("event_id") references "events" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "event_attendees" add constraint "event_attendees_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "event_attendees" add constraint "event_attendees_supporter_id_foreign" foreign key ("supporter_id") references "supporters" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "event_guests" add constraint "event_guests_event_id_foreign" foreign key ("event_id") references "events" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "event_guests" add constraint "event_guests_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "event_guests" add constraint "event_guests_supporter_id_foreign" foreign key ("supporter_id") references "supporters" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "community_integrations" add constraint "community_integrations_community_id_foreign" foreign key ("community_id") references "communities" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "applications" add constraint "applications_community_id_foreign" foreign key ("community_id") references "communities" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "ranked_questions" add constraint "ranked_questions_application_id_foreign" foreign key ("application_id") references "applications" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "ranked_questions" add constraint "ranked_questions_question_id_foreign" foreign key ("question_id") references "questions" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "members" add constraint "members_community_id_email_unique" unique ("community_id", "email");'
    );

    this.addSql(
      'alter table "event_invitees" add constraint "event_invitees_event_id_member_id_unique" unique ("event_id", "member_id");'
    );

    this.addSql(
      'alter table "event_watches" add constraint "event_watches_event_id_member_id_unique" unique ("event_id", "member_id");'
    );

    this.addSql(
      'alter table "supporters" add constraint "supporters_community_id_email_unique" unique ("community_id", "email");'
    );

    this.addSql(
      'alter table "event_attendees" add constraint "event_attendees_event_id_member_id_supporter_id_unique" unique ("event_id", "member_id", "supporter_id");'
    );

    this.addSql(
      'alter table "event_guests" add constraint "event_guests_event_id_member_id_supporter_id_unique" unique ("event_id", "member_id", "supporter_id");'
    );
  }
}
