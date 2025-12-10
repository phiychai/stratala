-- SQL script to drop tenant_id column from users table
-- Run this using your PostgreSQL client before restarting the dev server
--
-- Example: psql $PAYLOAD_DATABASE_URI -f src/scripts/drop-tenant-id.sql
-- Or connect to your database and run:
-- ALTER TABLE users DROP COLUMN IF EXISTS tenant_id;

ALTER TABLE users DROP COLUMN IF EXISTS tenant_id;

