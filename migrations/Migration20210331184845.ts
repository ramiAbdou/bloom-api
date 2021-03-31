import { Migration } from '@mikro-orm/migrations';

export class Migration20210331184845 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "communities" drop constraint "communities_default_type_id_foreign";'
    );
    this.addSql('drop index "communities_default_type_id_index";');

    this.addSql(
      'alter table "communities" add constraint "communities_default_type_id_foreign" foreign key ("default_type_id") references "member_types" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'create table "member_types" ("id" varchar(255) not null, "created_at" varchar(255) not null, "deleted_at" varchar(255) null, "updated_at" varchar(255) not null, "amount" decimal not null, "name" varchar(255) not null, "recurrence" text check ("recurrence" in (\'Monthly\', \'Yearly\')) not null, "stripe_price_id" varchar(255) null, "stripe_product_id" varchar(255) null, "community_id" varchar(255) not null);'
    );

    this.addSql(
      'alter table "member_types" add constraint "member_types_pkey" primary key ("id");'
    );

    this.addSql(
      'alter table "members" add column "member_type_id" varchar(255) null;'
    );

    this.addSql(
      'alter table "members" drop constraint "members_plan_id_foreign";'
    );
    this.addSql('alter table "members" drop column "plan_id";');

    this.addSql(
      'alter table "payments" add column "member_type_id" varchar(255) not null;'
    );

    this.addSql(
      'alter table "payments" drop constraint "payments_plan_id_foreign";'
    );
    this.addSql('alter table "payments" drop column "plan_id";');

    this.addSql(
      'alter table "questions" drop constraint if exists "questions_category_check";'
    );

    this.addSql(
      'alter table "questions" alter column "category" type text using ("category"::text);'
    );

    this.addSql(
      "alter table \"questions\" add constraint \"questions_category_check\" check (\"category\" in ('BIO', 'DUES_STATUS', 'EMAIL', 'EVENTS_ATTENDED', 'FACEBOOK_URL', 'FIRST_NAME', 'GENDER', 'INSTAGRAM_URL', 'JOINED_AT', 'LAST_NAME', 'LINKED_IN_URL', 'MEMBER_TYPE', 'TWITTER_URL'));"
    );

    this.addSql(
      'alter table "member_types" add constraint "member_types_community_id_foreign" foreign key ("community_id") references "communities" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "members" add constraint "members_member_type_id_foreign" foreign key ("member_type_id") references "member_types" ("id") on update cascade on delete set null;'
    );

    this.addSql(
      'alter table "payments" add constraint "payments_member_type_id_foreign" foreign key ("member_type_id") references "member_types" ("id") on update cascade;'
    );

    this.addSql('drop table if exists "member_plans" cascade;');
  }
}
