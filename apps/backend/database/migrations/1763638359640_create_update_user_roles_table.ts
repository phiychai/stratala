import { BaseSchema } from '@adonisjs/lucid/schema';
import db from '@adonisjs/lucid/services/db';

export default class extends BaseSchema {
  protected tableName = 'users';

  async up() {
    // Update role enum to include new roles
    // Note: PostgreSQL requires dropping the enum constraint first, then changing to string
    const connection = db.connection();
    const driverName = connection.driverName;

    if (driverName === 'postgres') {
      // First, drop the check constraint if it exists
      await connection.raw(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      `);
    }

    // Now alter the column to string type (allows any role value)
    this.schema.alterTable(this.tableName, (table) => {
      // For PostgreSQL, we've already dropped the constraint above
      // For SQLite, we just change the column type
      table.string('role', 50).defaultTo('user').notNullable().alter();
    });

    // No need to migrate existing 'user' values - they stay as 'user'
    // Existing 'admin' values also stay as 'admin'
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revert to original enum (only 'user' and 'admin')
      table.enum('role', ['user', 'admin']).defaultTo('user').notNullable().alter();
    });
  }
}
