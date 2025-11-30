import { Migration } from '@mikro-orm/migrations';

export class Migration20251130105606 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`project\` add column \`start_date\` datetime not null;`);
    this.addSql(`alter table \`project\` add column \`end_date\` datetime not null;`);
  }

}
