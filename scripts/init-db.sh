#!/usr/bin/env bash

# PostgreSQL's entrypoint runs this script only when the data directory is new.
# Keep database names deliberately restricted so they can be used safely as SQL
# identifiers without accepting arbitrary SQL through POSTGRES_MULTIPLE_DATABASES.
set -Eeuo pipefail

if [[ -z "${POSTGRES_MULTIPLE_DATABASES:-}" ]]; then
  exit 0
fi

admin_database="${POSTGRES_DB:-postgres}"
IFS=',' read -ra databases <<< "$POSTGRES_MULTIPLE_DATABASES"

for database in "${databases[@]}"; do
  # Trim optional whitespace around comma-separated names.
  database="${database#"${database%%[![:space:]]*}"}"
  database="${database%"${database##*[![:space:]]}"}"

  if [[ -z "$database" ]]; then
    continue
  fi

  if [[ ! "$database" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    printf 'Invalid database name in POSTGRES_MULTIPLE_DATABASES: %s\n' "$database" >&2
    exit 1
  fi

  exists="$(psql --username "$POSTGRES_USER" --dbname "$admin_database" --tuples-only --no-align \
    --command="SELECT 1 FROM pg_database WHERE datname = '$database'")"

  if [[ "$exists" != "1" ]]; then
    printf 'Creating database %s\n' "$database"
    psql --username "$POSTGRES_USER" --dbname "$admin_database" \
      --command="CREATE DATABASE \"$database\""
  else
    printf 'Database %s already exists; skipping\n' "$database"
  fi
done
