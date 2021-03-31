import { Migration } from '@mikro-orm/migrations';

/**
 * CHANGELOG
 *  - Changes all questions that have "category" of 'MEMBER_TYPE' to
 *  'MEMBER_PLAN'.
 *  - Drops all questions that have "category" of 'CLUBHOUSE_URL'.
 *  - Updates the constraint on "category".
 */
export class Migration20210331200212 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "questions" drop constraint if exists "questions_category_check";'
    );

    this.addSql(
      'update "questions" set "category" = \'MEMBER_TYPE\' where "category" = \'MEMBER_PLAN\';'
    );

    this.addSql(
      'delete from "questions" where "category" = \'CLUBHOUSE_URL\' cascade;'
    );

    this.addSql(
      'alter table "questions" alter column "category" type text using ("category"::text);'
    );

    this.addSql(
      "alter table \"questions\" add constraint \"questions_category_check\" check (\"category\" in ('BIO', 'DUES_STATUS', 'EMAIL', 'EVENTS_ATTENDED', 'FACEBOOK_URL', 'FIRST_NAME', 'GENDER', 'INSTAGRAM_URL', 'JOINED_AT', 'LAST_NAME', 'LINKED_IN_URL', 'MEMBER_TYPE', 'TWITTER_URL'));"
    );
  }
}
