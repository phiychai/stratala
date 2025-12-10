import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import db from '@adonisjs/lucid/services/db';
import env from '#start/env';

export default class FixRoleConstraint extends BaseCommand {
  static commandName = 'fix:role-constraint';
  static description = 'Drop the old role enum constraint to allow publisher role';

  static options: CommandOptions = {
    startApp: true,
  };

  async run() {
    try {
      // Use the same connection configuration as the app
      const dbConnection = env.get('DB_CONNECTION', 'postgres');
      this.logger.info(`Database connection: ${dbConnection}`);

      const connection = db.connection(dbConnection);

      // Get current database info
      if (dbConnection === 'postgres') {
        const dbInfo = await connection.raw(`SELECT current_database(), current_schema();`);
        this.logger.info(
          `Connected to database: ${dbInfo.rows?.[0]?.current_database || 'unknown'}`
        );
        this.logger.info(`Current schema: ${dbInfo.rows?.[0]?.current_schema || 'unknown'}`);
      }

      // Check the actual column type
      const columnInfo = await connection.raw(`
        SELECT
          column_name,
          data_type,
          udt_name,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role';
      `);

      if (columnInfo.rows && columnInfo.rows.length > 0) {
        const col = columnInfo.rows[0];
        this.logger.info(`Role column type: ${col.data_type} (${col.udt_name})`);
      }

      // Find ALL constraints including check constraints
      const allConstraints = await connection.raw(`
        SELECT
          conname,
          contype,
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conrelid = (
          SELECT oid FROM pg_class WHERE relname = 'users'
        )
        ORDER BY contype, conname;
      `);

      this.logger.info(`\nFound ${allConstraints.rows?.length || 0} constraint(s) on users table:`);
      if (allConstraints.rows) {
        for (const constraint of allConstraints.rows) {
          this.logger.info(
            `  - ${constraint.conname} (${constraint.contype}): ${constraint.definition}`
          );
        }
      }

      // Try to drop the constraint - use the exact table name with schema
      this.logger.info('\nAttempting to drop users_role_check constraint...');

      // Get the actual table OID to ensure we're working with the right table
      const tableInfo = await connection.raw(`
        SELECT
          schemaname,
          tablename,
          oid
        FROM pg_tables
        WHERE tablename = 'users';
      `);

      if (tableInfo.rows && tableInfo.rows.length > 0) {
        const table = tableInfo.rows[0];
        this.logger.info(`Found table: ${table.schemaname}.${table.tablename} (oid: ${table.oid})`);

        // Now find constraints on this specific table
        const tableConstraints = await connection.raw(`
          SELECT
            conname,
            contype,
            pg_get_constraintdef(oid) as definition
          FROM pg_constraint
          WHERE conrelid = ${table.oid}
          AND contype = 'c';
        `);

        this.logger.info(`Found ${tableConstraints.rows?.length || 0} check constraint(s):`);
        if (tableConstraints.rows) {
          for (const constraint of tableConstraints.rows) {
            this.logger.info(`  - ${constraint.conname}: ${constraint.definition}`);
            if (constraint.conname.includes('role')) {
              this.logger.info(`    Dropping ${constraint.conname}...`);
              await connection.raw(`
                ALTER TABLE ${table.schemaname}.${table.tablename}
                DROP CONSTRAINT ${constraint.conname} CASCADE;
              `);
              this.logger.success(`    ✅ Dropped ${constraint.conname}`);
            }
          }
        }
      }

      // Also try the direct approach
      await connection.raw(`
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check CASCADE;
      `);

      await connection.raw(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check CASCADE;
      `);

      this.logger.success('✅ Constraint drop commands executed!');
      this.logger.info('You can now create users with publisher, editor, and content_admin roles.');
    } catch (error) {
      this.logger.error('Failed to drop constraint:', error);
      if (error instanceof Error) {
        this.logger.error(error.message);
        this.logger.error('\nYou may need to manually run in your database:');
        this.logger.error(
          '  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check CASCADE;'
        );
      }
      this.exitCode = 1;
    }
  }
}
