/**
 * Script to reset all databases (Adonis + Better Auth + Payload)
 *
 * WARNING: This will delete all data in both databases!
 *
 * Run: pnpm exec tsx scripts/reset-all-databases.ts
 */

import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

// Load environment variables from root .env
const envPath = resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

/**
 * Normalize database host for local development
 * If host is 'postgres' (Docker service name) and we're running locally, use 'localhost'
 */
function normalizeHost(host: string | undefined): string {
  if (!host) return 'localhost';

  // If host is 'postgres' (Docker service name), check if we're in Docker
  // If not in Docker, use 'localhost' for local development
  if (host === 'postgres') {
    // Check if we're running in Docker by looking for /.dockerenv
    const isDocker = existsSync('/.dockerenv');
    return isDocker ? 'postgres' : 'localhost';
  }

  return host;
}

/**
 * Normalize database URI - replace 'postgres' host with 'localhost' if running locally
 */
function normalizeDatabaseUri(uri: string): string {
  try {
    const url = new URL(uri.replace('postgresql://', 'http://'));
    if (url.hostname === 'postgres') {
      const isDocker = existsSync('/.dockerenv');
      if (!isDocker) {
        url.hostname = 'localhost';
        return url.toString().replace('http://', 'postgresql://');
      }
    }
    return uri;
  } catch {
    return uri;
  }
}

async function resetAllDatabases() {
  // Get database connection strings
  // For Adonis, construct from DB_* variables to ensure we use adonis_db
  // If DB_* vars are available, use them; otherwise parse DATABASE_URI and replace db name
  let adonisDbUri: string;
  if (process.env.DB_HOST && process.env.DB_DATABASE) {
    // Use DB_* environment variables directly, but normalize host for local dev
    const normalizedHost = normalizeHost(process.env.DB_HOST);
    adonisDbUri = `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${normalizedHost}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE}`;
  } else if (process.env.DATABASE_URI) {
    // Parse DATABASE_URI and replace database name with adonis_db
    const normalizedUri = normalizeDatabaseUri(process.env.DATABASE_URI);
    const uri = new URL(normalizedUri.replace('postgresql://', 'http://'));
    uri.pathname = '/adonis_db';
    adonisDbUri = uri.toString().replace('http://', 'postgresql://');
  } else {
    // Fallback: construct from defaults
    adonisDbUri = `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${normalizeHost(process.env.DB_HOST)}:${process.env.DB_PORT || 5432}/adonis_db`;
  }

  // Normalize Payload database URI as well
  const rawPayloadDbUri = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI;
  const payloadDbUri = rawPayloadDbUri ? normalizeDatabaseUri(rawPayloadDbUri) : undefined;

  if (!adonisDbUri) {
    console.error('Error: DATABASE_URI or DB_* environment variables are required');
    process.exit(1);
  }

  if (!payloadDbUri) {
    console.error('Error: PAYLOAD_DATABASE_URI or DATABASE_URI environment variable is required');
    process.exit(1);
  }

  // Parse connection strings to get database names
  const parseDbName = (uri: string): string => {
    try {
      const url = new URL(uri.replace('postgresql://', 'http://'));
      return url.pathname.slice(1); // Remove leading /
    } catch {
      // Fallback: extract from connection string
      const match = uri.match(/\/([^/?]+)/);
      return match ? match[1] : '';
    }
  };

  const adonisDbName = parseDbName(adonisDbUri);
  const payloadDbName = parseDbName(payloadDbUri);

  // Get base connection string (connect to postgres database)
  const getBaseConnection = (uri: string): string => {
    const dbName = parseDbName(uri);
    return uri.replace(`/${dbName}`, '/postgres');
  };

  const adonisBaseUri = getBaseConnection(adonisDbUri);
  const payloadBaseUri = getBaseConnection(payloadDbUri);

  console.log('⚠️  WARNING: This will delete all data in both databases!');
  console.log(`Adonis/Better Auth Database: ${adonisDbName}`);
  console.log(`Payload Database: ${payloadDbName}`);
  console.log('');

  // Reset Adonis database
  const adonisClient = new pg.Client({ connectionString: adonisBaseUri });
  try {
    await adonisClient.connect();
    console.log(`\n📦 Resetting Adonis/Better Auth database (${adonisDbName})...`);

    // Terminate all connections
    await adonisClient.query(
      `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid();
    `,
      [adonisDbName]
    );

    // Drop and recreate
    await adonisClient.query(`DROP DATABASE IF EXISTS ${adonisDbName};`);
    console.log(`  ✓ Dropped database: ${adonisDbName}`);

    await adonisClient.query(`CREATE DATABASE ${adonisDbName};`);
    console.log(`  ✓ Created database: ${adonisDbName}`);
  } catch (error) {
    console.error(`Error resetting Adonis database: ${error}`);
    throw error;
  } finally {
    await adonisClient.end();
  }

  // Reset Payload database (if different from Adonis)
  if (payloadDbName !== adonisDbName) {
    const payloadClient = new pg.Client({ connectionString: payloadBaseUri });
    try {
      await payloadClient.connect();
      console.log(`\n📦 Resetting Payload database (${payloadDbName})...`);

      // Terminate all connections
      await payloadClient.query(
        `
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid();
      `,
        [payloadDbName]
      );

      // Drop and recreate
      await payloadClient.query(`DROP DATABASE IF EXISTS ${payloadDbName};`);
      console.log(`  ✓ Dropped database: ${payloadDbName}`);

      await payloadClient.query(`CREATE DATABASE ${payloadDbName};`);
      console.log(`  ✓ Created database: ${payloadDbName}`);
    } catch (error) {
      console.error(`Error resetting Payload database: ${error}`);
      throw error;
    } finally {
      await payloadClient.end();
    }
  } else {
    console.log(`\n📦 Payload uses the same database as Adonis, already reset.`);
  }

  console.log('\n✅ All databases reset complete!');
  console.log('\nNext steps:');
  console.log('1. Run database migrations for AdonisJS');
  console.log('2. Restart your Payload dev server (schema will be auto-created)');
  console.log('3. Run seed:all to populate with test data');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetAllDatabases()
    .then(() => {
      console.log('\nScript completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nScript failed:', error);
      process.exit(1);
    });
}

export default resetAllDatabases;
