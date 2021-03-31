import { Migration } from '@mikro-orm/migrations';

/**
 * CHANGELOG
 *  - Adds the "position" field to the "members" table.
 */
export class Migration20210331211201 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "members" add column "position" varchar(255) null;'
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "members" drop column "position";');
  }
}
