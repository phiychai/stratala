import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'content_views';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.enum('content_type', ['post', 'video']).notNullable();
      table.string('content_id').notNullable(); // Payload ID as string
      table.integer('user_id').nullable().unsigned(); // Nullable for anonymous views
      table.string('ip_address').nullable(); // For anonymous views
      table.timestamp('viewed_at').notNullable();

      // Foreign key to users table (nullable)
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');

      // Indexes for performance
      table.index(['content_type', 'content_id']);
      table.index('user_id');
      table.index('viewed_at');
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}

