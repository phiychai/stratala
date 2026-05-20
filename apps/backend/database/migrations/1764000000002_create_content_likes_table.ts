import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'content_likes';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.enum('content_type', ['post', 'video']).notNullable();
      table.string('content_id').notNullable(); // Payload ID as string
      table.integer('user_id').notNullable().unsigned();
      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();

      // Foreign key to users table
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

      // Unique constraint to prevent duplicate likes
      table.unique(['content_type', 'content_id', 'user_id']);

      // Indexes for performance
      table.index(['content_type', 'content_id']);
      table.index('user_id');
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
