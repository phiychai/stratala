import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'user_follows';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().unsigned();
      table.string('space_id').notNullable(); // Payload tenant/space ID as string
      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();

      // Foreign key to users table
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

      // Unique constraint to prevent duplicate follows
      table.unique(['user_id', 'space_id']);

      // Indexes for performance
      table.index('user_id');
      table.index('space_id');
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
