# Vault Reliability and GitHub Batch

## Scope

Continue on `mobile-ui-foundation` from `914791711`. Address unloaded-note
mutations and recovery, then GitHub onboarding/request/sync reliability. Use
isolated fixtures or a simulator copy of Laputa, never the user's vault remote.
Live private-repository QA requires a public OAuth Client ID, device-flow
authorization by the owner, and an explicitly designated disposable repository.

## Temporary Analyzer Exception

- Approver: Luca, repository owner; explicit approval in this task on
  2026-10-11 following the scoped exception request.
- Recorded: 2026-10-11 09:42 UTC. Expires: 2026-10-12 09:42 UTC; close earlier
  when the batch finishes or access returns. Review/remove within seven days.
- Blocked commands: CodeScene MCP `pre_commit_code_health_safeguard` and
  `analyze_change_set` are not exposed by the current tool inventory. Codacy
  cloud `codacy tools gh refactoringhq tolaria --output json` failed twice with
  `No API token found`; cloud file baselines, analyzer parity, and exact-SHA
  post-push verification therefore remain unavailable, not zero findings.
- Affected scope: mobile workspace edit orchestration/history/read guards,
  vault status/recovery, `apps/mobile/src/workspace/git/` authentication and
  sync, associated mobile/native regression tests, localized copy if needed,
  and batch/architecture documentation. Exact touched files are recorded below
  before commit; this is not a repository-wide waiver.
- Risk: local analyzer results cannot prove cloud analyzer parity or substitute
  for exact-SHA server verification. Missing MCP safeguards cannot be reported
  as passing.
- Compensating checks: per-file before/after CodeScene CLI reviews and staged
  delta, CodeScene project API floors, complete configured local Codacy
  per-file results, scoped mobile tests/lint/typecheck, actual iOS simulator
  interaction and regression evidence. No gate suppression or force push.
- This permits experimental branch work, not promotion or release approval.

## Starting Evidence

- CodeScene API: Hotspot `10.0`, Average `9.991289158049293`; floors `10.0` and
  `9.99`, respectively. Passing before edits.
- Focused baseline: 52 tests across seven files pass (note reads, persistence,
  history, editor sync preparation, saved-vault operations, GitHub auth/state).
- Read-only reproduction: deleting a metadata-only note emits `deleteNote`;
  Undo emits `restoreNote` and restores the in-memory note but **zero writes**.
  The file is therefore not restored by Undo.
- `EXPO_PUBLIC_GITHUB_CLIENT_ID` is not configured in the shell; no mobile
  `.env` configuration was found. No credentials were read or printed.

## Batch 1: Prepared Note Actions

Metadata-only note actions now load the required content before changing notes.
Delete history captures those bytes before removal. Bulk preparation is
all-or-nothing on read failure and deduplicates targets. Loaded editor writes
remain synchronous; pending action preparations join the existing editor sync
barrier. Stale vault generations cannot apply a delayed result. Failed reads
expose the existing localized read-error label and a footer retry button.

Evidence directory: `/Volumes/Jupiter/Cache/tolaria-mobile-vault-2026-10-11`.
The full inherited branch inventory and the exact batch manifest are recorded
separately; this scoped batch does not certify all inherited mobile branch code.

| Code file (under `apps/mobile/`) | Classification | CodeScene before / after |
| --- | --- | --- |
| `src/workspace/mobileNoteRead.ts` | Existing | 10 / 10 |
| `src/workspace/mobilePreparedEdits.ts` | New | - / 10 |
| `src/workspace/mobilePreparedEdits.test.ts` | New | - / 10 |
| `src/screens/usePreparedWorkspaceEdits.ts` | New | - / 10 |
| `src/screens/tabletWorkspacePersistence.ts` | Existing | 10 / 10 |
| `src/screens/useTabletWorkspaceController.ts` | Existing | 10 / 10 |
| `src/components/workspace/MobileSyncStatusBar.tsx` | Existing | 10 / 10 |
| `src/screens/TabletWorkspace.tsx` | Existing | 10 / 10 |
| `src/screens/PhoneWorkspace.tsx` | Existing | 10 / 10 |
| `tests/mobile-host-unloaded-actions.spec.ts` | New | - / 10 |
| `native-ui-tests/TabletPreparedNoteActionTests.swift` | New | - / 10 |

- Local Codacy: every existing file above started at zero; every file finishes
  with zero findings/errors at all severities. Each TS/TSX file completed Biome
  2.5.6, project ESLint 9.39.2 with `eslint.config.js` (CLI capability version
  9.39.5), Opengrep 1.26.0, Trivy 0.72.0, and Lizard 1.23.0. The Swift test
  completed Opengrep, Trivy, and Lizard. All report one file analyzed; complete
  per-file results and analyzer metadata are retained, not added-line filtering.
  Tests use the same local tools with repository test exclusions removed.
- CodeScene: all eleven files finish at 10.0 without findings. The staged CLI
  delta checked eleven eligible files and returned `no-issues-found`. MCP
  safeguards remain unavailable under the recorded exception, not passing.
- Tests: red import/regression stage followed by 55 passing focused tests in six
  files. Mobile typecheck and touched-file ESLint pass. Host Playwright: five
  passing flows, one intentionally skipped phone-only case. Three new `@smoke`
  cases cover archive, exact-byte delete/Undo, and failed-read retry; existing
  property/relationship persistence and editor Undo/Redo also pass.
- Native: an optimized Hermes bundle in the actual iOS 18.3 iPad simulator uses
  the isolated 6,036-note Laputa copy plus one disposable organized test note.
  UI navigation was inspected with computer use. XCUITest deletes the unopened
  note from the list, restores it through Undo, backgrounds and restarts the app,
  and checks the WYSIWYG body again. Host comparison confirms the restored file
  matches its original bytes exactly. No user vault or remote is modified.
- Coverage: full desktop/Rust coverage was not rerun for this experimental
  mobile-only batch, per the scoped mobile workflow. No release claim.
- Localization: no UI copy changes; existing translated labels reused.
- PostHog: no event needed for these recovery bug fixes; they introduce no new
  meaningful product action. The mobile consent boundary is unchanged.
- Refactoring: extracted read-target lookup and hydration/status presentation
  helpers to keep each touched/new code file at CodeScene 10.
- ADRs: none; repairs the existing edit and sync boundaries without adding a
  dependency or changing storage. Docs: this handoff and `docs/ABSTRACTIONS.md`.
- Demo fixture dirt: `git status --short -- demo-vault demo-vault-v2` is empty.
- Cloud Codacy baselines/parity/exact-SHA verification remain unavailable under
  the exception above. Final normal-hook commit/push and native final rerun are
  recorded in the task handoff after completion.

Structural move/backlink transactions and binary-file Undo are not solved by
this preparation layer. GitHub onboarding/live remote verification remains the
next batch, not implied by the note-action checks above.
