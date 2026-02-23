---
name: "OPSX: Plane Sync"
description: Sync OpenSpec changes with Plane project management
category: Workflow
tags: [workflow, plane, sync]
---

Sync OpenSpec change tasks to Plane issues in the **Stratala** project.

**Input**: Optionally specify a change name (e.g., `/opsx-plane-sync add-auth`). If omitted, syncs all active changes.

**Steps**

1. **Determine which changes to sync**

   If a change name is provided, use it. Otherwise run:
   ```bash
   openspec list --json 2>/dev/null
   ```
   Use all changes with `status != "archived"`. Skip the `archive` directory.

2. **Run the sync script**

   For a specific change:
   ```bash
   bash scripts/plane-sync.sh <change-name>
   ```

   For all active changes:
   ```bash
   bash scripts/plane-sync.sh
   ```

   The script:
   - Resolves the **Stratala** project ID from the Plane API
   - Resolves Todo/Done state IDs
   - Reads each `openspec/changes/<name>/tasks.md`
   - Creates a Plane issue per task with prefix `[<change-name>]`
   - Sets state: `- [x]` → **Done**, `- [ ]` → **Todo**

3. **Report summary**

   Show the script output — issue IDs and names created per change.

---

## When to run this workflow

| Trigger | Action |
|---|---|
| After `/opsx-new` or `/opsx-ff` | Run sync to create **Todo** issues in Plane |
| After `/opsx-apply` completes all tasks | Run sync to push completed tasks as **Done** |
| Before `/opsx-archive` | Run sync to ensure Plane reflects final state |

## Config

All config is read from environment or falls back to defaults in the script:

| Env var | Default |
|---|---|
| `PLANE_API_KEY` | set in Windsurf MCP config |
| `PLANE_BASE_URL` | `https://plane.lan/api` |
| `PLANE_WORKSPACE_SLUG` | `myworkspace` |
| `PLANE_PROJECT_NAME` | `Stratala` |

## Guardrails

- Always run from the repo root (where `openspec/` and `scripts/` live)
- The script creates new issues each run — do not run twice for the same change unless intentional
- If a change has no `tasks.md`, it is skipped with a warning
