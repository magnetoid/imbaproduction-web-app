#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  Imba Production — Create a new migration file
#
#  Usage: ./scripts/new-migration.sh "description of change"
#
#  Example:
#    ./scripts/new-migration.sh "add user preferences table"
#    → creates: migrations/V003__add_user_preferences_table.sql
# ═══════════════════════════════════════════════════════════════
set -e

DESCRIPTION="$1"
if [ -z "$DESCRIPTION" ]; then
  echo "Usage: ./scripts/new-migration.sh \"description of change\""
  echo ""
  echo "Examples:"
  echo "  ./scripts/new-migration.sh \"add portfolio video duration\""
  echo "  ./scripts/new-migration.sh \"create newsletter subscribers table\""
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$(dirname "$SCRIPT_DIR")/migrations"
mkdir -p "$MIGRATIONS_DIR"

# Next version number (zero-padded 3 digits)
LAST=$(ls "$MIGRATIONS_DIR"/V*.sql 2>/dev/null \
  | grep -oE 'V[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1)
NEXT=$(printf "%03d" $((${LAST:-0} + 1)))

# Slug: lowercase, non-alphanumeric → underscore, collapse multiples
SLUG=$(echo "$DESCRIPTION" \
  | tr '[:upper:]' '[:lower:]' \
  | sed 's/[^a-z0-9]/_/g' \
  | sed 's/__*/_/g' \
  | sed 's/^_\|_$//g')

FILENAME="migrations/V${NEXT}__${SLUG}.sql"
FULL_PATH="$MIGRATIONS_DIR/V${NEXT}__${SLUG}.sql"

cat > "$FULL_PATH" << SQL
-- ═══════════════════════════════════════════════════════════════
--  V${NEXT}: ${DESCRIPTION}
--  Created: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
--
--  ⚠  Write idempotent SQL — use IF NOT EXISTS / IF EXISTS
--     so migrations are safe to re-run if needed.
-- ═══════════════════════════════════════════════════════════════


SQL

echo "✅  Created: $FILENAME"
echo "    Edit the file, then deploy and run:  ./scripts/migrate.sh"
