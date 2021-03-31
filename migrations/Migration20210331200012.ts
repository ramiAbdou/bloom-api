import { Migration } from '@mikro-orm/migrations';

export class Migration20210331200012 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "member_plans" rename to "member_types";');

    this.addSql(
      'alter table "members" rename column "plan_id" to "member_type_id";'
    );

    this.addSql(
      'alter table "payments" rename column "plan_id" to "member_type_id";'
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "member_types" rename to "member_plans";');

    this.addSql(
      'alter table "members" rename column "member_type_id" to "plan_id";'
    );

    this.addSql(
      'alter table "payments" rename column "member_type_id" to "plan_id";'
    );
  }
}
