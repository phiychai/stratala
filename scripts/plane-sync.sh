#!/usr/bin/env bash
# plane-sync.sh — Sync OpenSpec change tasks to Plane issues
#
# Usage:
#   bash scripts/plane-sync.sh [change-name]
#   bash scripts/plane-sync.sh                  # syncs all active changes
#   bash scripts/plane-sync.sh move-feed-to-adonis
#
# Config (reads from env or falls back to defaults):
#   PLANE_API_KEY, PLANE_BASE_URL, PLANE_WORKSPACE_SLUG, PLANE_PROJECT_NAME

set -e

API_KEY="${PLANE_API_KEY:-plane_api_8f25f8bca3eb487eb1ed97d01351bb97}"
BASE_URL="${PLANE_BASE_URL:-https://plane.lan/api}"
WORKSPACE="${PLANE_WORKSPACE_SLUG:-myworkspace}"
PROJECT_NAME="${PLANE_PROJECT_NAME:-Stratala}"
CHANGES_DIR="openspec/changes"

# ── Resolve project ID ────────────────────────────────────────────────────────
resolve_project_id() {
  curl -s -k \
    -H "X-API-Key: $API_KEY" \
    "$BASE_URL/v1/workspaces/$WORKSPACE/projects/" \
    | python3 -c "
import sys, json
data = json.load(sys.stdin)
for p in data.get('results', []):
    if p['name'].lower() == '${PROJECT_NAME}'.lower():
        print(p['id'])
        sys.exit(0)
sys.exit(1)
"
}

# ── Resolve state IDs ─────────────────────────────────────────────────────────
resolve_states() {
  local project_id="$1"
  curl -s -k \
    -H "X-API-Key: $API_KEY" \
    "$BASE_URL/v1/workspaces/$WORKSPACE/projects/$project_id/states/" \
    | python3 -c "
import sys, json
data = json.load(sys.stdin)
todo_id = ''
done_id = ''
for s in data.get('results', []):
    if s['name'].lower() == 'todo':
        todo_id = s['id']
    elif s['name'].lower() == 'done':
        done_id = s['id']
print(todo_id, done_id)
"
}

# ── Create a single issue ─────────────────────────────────────────────────────
create_issue() {
  local project_id="$1"
  local name="$2"
  local state_id="$3"
  local label="$4"  # change name for context

  # Escape double quotes in name
  local escaped_name
  escaped_name=$(echo "$name" | sed 's/"/\\"/g')

  curl -s -k \
    -X POST \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"[$label] $escaped_name\", \"state\": \"$state_id\"}" \
    "$BASE_URL/v1/workspaces/$WORKSPACE/projects/$project_id/issues/" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'sequence_id' in d:
    print('  ✅ STRATALA-' + str(d['sequence_id']) + '  ' + d.get('name',''))
else:
    print('  ❌ Error:', json.dumps(d))
"
}

# ── Sync a single change ──────────────────────────────────────────────────────
sync_change() {
  local change="$1"
  local project_id="$2"
  local state_todo="$3"
  local state_done="$4"
  local tasks_file="$CHANGES_DIR/$change/tasks.md"

  if [ ! -f "$tasks_file" ]; then
    echo "  ⚠️  No tasks.md found for $change, skipping."
    return
  fi

  echo ""
  echo "=== $change ==="

  local count=0
  while IFS= read -r line; do
    # Match task lines: - [ ] or - [x]
    if [[ "$line" =~ ^[[:space:]]*-[[:space:]]\[([ x])\][[:space:]](.+)$ ]]; then
      local checked="${BASH_REMATCH[1]}"
      local task_name="${BASH_REMATCH[2]}"
      # Strip trailing whitespace
      task_name="${task_name%"${task_name##*[![:space:]]}"}"

      if [ "$checked" = "x" ]; then
        create_issue "$project_id" "$task_name" "$state_done" "$change"
      else
        create_issue "$project_id" "$task_name" "$state_todo" "$change"
      fi
      ((count++)) || true
    fi
  done < "$tasks_file"

  echo "  → $count issues created for $change"
}

# ── Main ──────────────────────────────────────────────────────────────────────
echo "🔍 Resolving Plane project: $PROJECT_NAME..."
PROJECT_ID=$(resolve_project_id)
if [ -z "$PROJECT_ID" ]; then
  echo "❌ Project '$PROJECT_NAME' not found in workspace '$WORKSPACE'"
  exit 1
fi
echo "✅ Project ID: $PROJECT_ID"

echo "🔍 Resolving states..."
read -r STATE_TODO STATE_DONE <<< "$(resolve_states "$PROJECT_ID")"
if [ -z "$STATE_TODO" ] || [ -z "$STATE_DONE" ]; then
  echo "❌ Could not resolve Todo/Done states"
  exit 1
fi
echo "✅ Todo: $STATE_TODO  Done: $STATE_DONE"

TOTAL=0

if [ -n "$1" ]; then
  # Single change specified
  sync_change "$1" "$PROJECT_ID" "$STATE_TODO" "$STATE_DONE"
else
  # All active changes
  for change_dir in "$CHANGES_DIR"/*/; do
    change=$(basename "$change_dir")
    # Skip archive directory
    [ "$change" = "archive" ] && continue
    sync_change "$change" "$PROJECT_ID" "$STATE_TODO" "$STATE_DONE"
  done
fi

echo ""
echo "✅ Plane sync complete."
