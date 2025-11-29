import { Migration } from '@mikro-orm/migrations';

export class Migration20251129185002 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`project\` (\`id\` uuid not null, \`created_at\` datetime null, \`updated_at\` datetime null, \`deleted_at\` datetime null, \`name\` text not null, \`description\` text not null, \`is_archived\` integer not null default false, primary key (\`id\`));`);
  }

}
