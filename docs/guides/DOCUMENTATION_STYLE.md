# Documentation style guide

Status: active

Audience: maintainers, designers, and implementation agents

## Purpose

Documentation should let the next person decide what is true, what is planned, what was verified, and what remains uncertain without reconstructing an agent's session.

## Source-of-truth rules

- Keep one authoritative document per concern. Link to it instead of duplicating it.
- `repair-UI.md` owns roadmap state and completion checklists.
- `basecase-UI.md` owns baseline evidence and diagnosis.
- `AGENTS.md` owns repository-wide agent behavior.
- Files in `docs/guides/` own durable working conventions.
- Canonical mockup filenames are referenced explicitly; rejected explorations are never labeled as approved.

When a decision changes, update the authoritative source and every direct index/link to it. Do not leave contradictory instructions with no precedence note.

## Writing conventions

- Lead with the outcome or rule, then the reason.
- Use plain language and concrete nouns. Avoid filler such as “simply,” “obviously,” “clean up,” or “make it better.”
- Use sentence case for headings.
- Keep paragraphs focused. Use tables only for genuine comparisons or mappings.
- Use repository-relative Markdown links inside repository documents.
- Put commands and literal identifiers in backticks.
- Use ISO dates (`YYYY-MM-DD`) and include the relevant timezone when a time matters.
- Distinguish facts, inferences, proposals, and decisions.
- Do not paste large transient logs. Record the command, result, date, and the small part needed to explain a failure.

## Checklist semantics

- `[ ]` means not yet verified.
- `[x]` means the acceptance condition was tested and evidence exists.
- `Blocked — <reason>` means work cannot safely continue without a decision or external state change.
- Never mark a parent item complete while a required child item is incomplete.
- Record evidence beside the item or in the package handoff: command, viewport/browser, screenshot path, or measured value.
- If a regression reopens an item, change it back to `[ ]` and explain why.

## Status headers

Plans and audits begin with a compact status block:

```text
Status: ready | active | blocked | complete
Last updated: YYYY-MM-DD
Scope: short description
```

Use `complete` only when every stated exit criterion passes.

## Visual evidence

- Store approved and audit images in `docs/ui-audit/`.
- Use descriptive lowercase filenames with hyphens: `redesign-works-concept-v3-no-highlighter.png`.
- Include the route, viewport, browser/engine, date, and state in the surrounding document.
- Keep baseline, exploration, and canonical images clearly labeled.
- Do not overwrite an approved mockup. Save a new version and update the canonical link.
- Do not commit temporary captures, duplicate exports, or images with secrets/private content.

## Decision records

Create `docs/decisions/NNN-short-title.md` only for a durable choice with meaningful tradeoffs, such as replacing a rendering technique or adding a dependency. Include:

1. context;
2. decision;
3. consequences;
4. rejected alternatives;
5. date and status.

Do not create a decision record for ordinary component implementation.

## Handoffs

Every substantial agent handoff states:

- work package and outcome;
- files changed;
- checks run and their results;
- screenshots or measurements;
- assumptions and known gaps;
- the next safe action.

Avoid diary-style narration. A handoff should be useful after the original conversation is gone.
