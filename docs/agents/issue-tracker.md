# Issue tracker: Linear

Issues and specs for this repository live in the `Stratala` project in Linear.
Use Linear MCP for all issue operations.

## Scope

- Use the Linear account's default team.
- Place newly created issues in the `Stratala` project.
- Before the first write in a session, resolve and confirm the target team and
  project through Linear MCP.
- Never create issues in another team or project merely because it appears in
  search results.

## Conventions

- Search for an existing issue before creating a duplicate.
- Create issues with a concise title and a complete Markdown description.
- Read the issue description, labels, status, relationships, and comments before
  acting.
- Represent blocking relationships with Linear's native issue relations.
- A ticket is startable when it is open, unassigned, and has no unresolved
  blockers.
- Use comments for progress, decisions, and closure explanations.
- Apply triage labels using `docs/agents/triage-labels.md`.
- Preserve existing project, cycle, priority, and assignee values unless the task
  requires changing them.

## When a skill says "publish to the issue tracker"

Create an issue in the default team's `Stratala` project through Linear MCP.

## When a skill says "fetch the relevant ticket"

Fetch the referenced Linear issue, including its description, labels, status,
relations, and comments.

## Wayfinding operations

- **Map:** one Linear issue containing Notes, Decisions-so-far, and Fog.
- **Child ticket:** a related child issue in the `Stratala` project.
- **Blocking:** Linear's native blocking and blocked-by relations.
- **Frontier:** open, unassigned child issues without unresolved blockers, in map
  order.
- **Claim:** assign the issue to the driving developer before beginning work.
- **Resolve:** comment with the answer, update the map's Decisions-so-far, and
  mark the issue complete.
