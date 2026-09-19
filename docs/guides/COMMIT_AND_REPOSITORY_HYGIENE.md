# Commit and repository hygiene

Status: active

Applies to: all contributors and agents

## Branches and parallel work

- Use one branch or managed worktree per work package when tasks run in parallel.
- Use branch names such as `codex/ui-shell`, `codex/ui-home`, or `codex/ui-works`.
- Branch from the agreed integration point. Do not guess a base ref when the task names one.
- Avoid overlapping file ownership. Shell/token work lands before page work that consumes it.
- Do not hand-edit another worktree or copy its `.git` metadata.

## Before editing

Run and inspect:

```bash
git status --short
git diff --stat
git branch --show-current
```

Treat unfamiliar changes as owned by someone else. Do not use destructive checkout, reset, clean, stash, or bulk formatting to make the tree look tidy.

## Commit boundaries

One commit should express one reviewable reason to change. Good boundaries include:

- design tokens and base focus styles;
- semantic site shell and menu behavior;
- home view implementation;
- Works index implementation;
- detail-shell migration;
- removal of verified dead visual infrastructure;
- documentation only.

Do not combine dependency updates, generated media, content changes, refactors, and visual behavior unless they are inseparable from one outcome.

## Commit messages

Use an imperative Conventional Commit-style subject:

```text
feat(shell): add the collapsed site menu
feat(home): implement the centered portrait composition
refactor(works): move the index to the shared shell
fix(a11y): restore visible keyboard focus
perf(ui): stop loading Three.js on reading routes
docs(ui): add redesign acceptance gates
chore(build): add the typecheck command
```

- Keep the subject concise and specific.
- Use a body when the reason, migration, tradeoff, or verification is not obvious from the diff.
- Do not use messages such as `stable`, `updates`, `fix stuff`, timestamps, or unexplained numbers.
- Reference an issue or work-package ID when one exists.

## Staging and review

- Stage explicit files or hunks after reviewing them.
- Before committing, inspect `git diff --cached --stat` and `git diff --cached`.
- Use `git diff --check` to catch conflict markers and whitespace errors.
- Verify that no secret, token, `.env` file, personal path, debug log, or unrelated user change is staged.
- Do not commit `.next/`, `content-data/`, editor state, OS metadata, or transient browser output.
- Commit only intentional screenshots in `docs/ui-audit/`, with a descriptive name and a documentation reference.

## Required verification

The minimum code-change gate is:

```bash
npm run lint
npm run typecheck
npm run build
```

Add route-specific browser and screenshot checks for UI work. Add `npm run validate` only when local content is configured. Never claim a check passed if it was skipped, unavailable, or failed for a pre-existing reason; record that state explicitly.

## History safety

- Never force-push shared work without explicit coordination.
- Never amend, squash, rebase, revert, or reset another contributor's commit as routine cleanup.
- Do not delete old components in the same commit that first introduces their replacement. Remove them only after parity and route verification.
- If a change must be backed out, prefer a clear revert or follow-up fix that preserves traceability.

## Handoff template

```text
Work package: R# — name
Branch/worktree: name or path
Outcome: one sentence
Changed: file list
Checks: command — pass/fail/skipped and reason
Visual evidence: route, viewport, browser, screenshot path
Known gaps: explicit list or “none known”
Next safe step: one sentence
```
