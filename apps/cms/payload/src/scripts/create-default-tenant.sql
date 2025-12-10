-- SQL script to create a default tenant directly in the database
-- This bypasses Payload's access control to solve the chicken-and-egg problem
--
-- Run this using your PostgreSQL client:
-- psql $PAYLOAD_DATABASE_URI -f src/scripts/create-default-tenant.sql
-- Or connect to your database and run the commands below

-- Create default tenant
INSERT INTO tenants (id, name, slug, domain, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Default Tenant',
  'default',
  '',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Get the tenant ID (you'll need this for the next step)
SELECT id, name, slug FROM tenants WHERE slug = 'default';

