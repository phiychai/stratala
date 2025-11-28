import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'users';

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Rename column from directus_user_id to payload_user_id (historical migration)
      table.renameColumn('directus_user_id', 'payload_user_id');
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Rename back to directus_user_id (rollback - historical)
      table.renameColumn('payload_user_id', 'directus_user_id');
    });
  }
}
