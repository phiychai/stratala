# Domain Docs

How engineering skills consume this repository's domain documentation.

## Before exploring, read these

- `GLOSSARY.md` at the repository root.
- Relevant ADRs under `docs/adr/`.

If these files do not exist, proceed silently. Do not suggest creating them
upfront. The domain-modeling workflows create them lazily when terminology or
decisions are resolved.

## Layout

This repository uses one shared product context:

- `GLOSSARY.md` contains product-wide domain terminology.
- `docs/adr/` contains product-wide architecture decisions.
- Applications and packages use the shared vocabulary rather than maintaining
  separate glossaries.

## Use the glossary's vocabulary

Use terms defined in `GLOSSARY.md` in issue titles, proposals, hypotheses, and
test names. Avoid synonyms that the glossary explicitly rejects. If a needed
concept is absent, reconsider whether it is project terminology or record the
gap for domain modeling.

## Flag ADR conflicts

Explicitly identify output that contradicts an existing ADR rather than silently
overriding the decision.
