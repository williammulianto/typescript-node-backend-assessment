import { Migration } from '@mikro-orm/migrations';

export class Migration20251130173332 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`task\` (\`id\` uuid not null, \`created_at\` datetime null, \`updated_at\` datetime null, \`deleted_at\` datetime null, \`name\` text not null, \`description\` text not null, \`status\` text check (\`status\` in ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED')) not null default 'PENDING', \`due_date\` datetime not null, \`project_id\` uuid not null, constraint \`task_project_id_foreign\` foreign key(\`project_id\`) references \`project\`(\`id\`) on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`task_project_id_index\` on \`task\` (\`project_id\`);`);
  }

}
