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

Batch 1 was committed as `e9d02efc4` and pushed to
`origin/mobile-ui-foundation` through normal hooks: 1,283 mobile tests passed,
along with mobile lint/typecheck and web export. The final native delete/Undo
regression passed in 25.91 seconds; its disposable note was removed afterward.

## Batch 2: Authentication and Save Failure Recovery

GitHub JSON requests now have a deadline covering headers and body. Cancellation
settles the caller even when a transport ignores abort; already-cancelled work
never starts. Device-code creation, token/identity lookup, refresh, and repository
listing propagate cancellation. Unknown transport/response text never becomes UI
copy. Credential deletion must succeed before the visible account is cleared.
No session is handed out while credential deletion is pending. Errors distinguish
authorization, network, timeout, and secure-storage failures.
Local save failures take precedence over "Local only" and can retry through the
existing editor/disk save barrier without requiring a Git remote. Remote work
cannot start until that barrier succeeds.

Exact code manifest, relative to `apps/mobile/`:

| Code file | Classification | CodeScene before / after |
| --- | --- | --- |
| `src/workspace/git/githubRequest.ts` | Existing | 10 / 10 |
| `src/workspace/git/githubAuth.ts` | Existing | 10 / 10 |
| `src/workspace/git/githubAccountState.ts` | Existing | 10 / 10 |
| `src/workspace/git/useGitHubAccount.ts` | Existing | 10 / 10 |
| `src/workspace/git/useMobileVaults.ts` | Existing | 10 / 10 |
| `src/components/vaults/useVaultSyncPresentation.ts` | Existing | 10 / 10 |
| `src/components/vaults/MobileGitHubAccount.tsx` | Existing | 10 / 10 |
| `src/components/vaults/MobileVaultManager.tsx` | Existing | 10 / 10 |
| `src/components/workspace/MobileSyncStatusBar.tsx` | Existing | 10 / 10 |
| `src/workspace/git/githubFailure.ts` | New | - / no scorable code, zero findings |
| `src/workspace/git/githubRequest.test.ts` | New | - / 10 |
| `src/workspace/git/githubAccountRecovery.test.ts` | New | - / 10 |
| `src/workspace/git/githubCancellation.test.ts` | New | - / 10 |
| `src/components/vaults/vaultSyncFailure.test.ts` | New | - / 10 |
| `native-ui-tests/TabletVaultManagerTests.swift` | New | - / 10 |

- CodeScene: project API remains Hotspot 10 / Average 9.991289158049293.
  Staged CLI delta checks all 15 code files with `no-issues-found`. Repository
  publication was extracted to keep the account state at 10. MCP gates remain
  unavailable under the owner-approved exception, not passing.
- Codacy local: all nine existing files started at zero and remain zero. Every
  new file has zero whole-file findings at all severities. The 73 per-analyzer
  result rows in `github-analyzer-matrix.json` confirm every expected analyzer
  completed on exactly one file. Same analyzer identities/configurations as
  batch 1; five per TS file and three per Swift file. No skipped/partial target
  counts as passing. Cloud baselines/parity/exact-SHA results remain unavailable.
- Tests: red failures reproduced, then 35 focused tests across eight files pass,
  including cancellation during identity verification, stalled JSON bodies,
  failed sign-out/retry, safe error mapping, and local-save status/retry. Existing
  saved-vault tests confirm failed writes keep drafts mounted and prevent remote
  work until retry succeeds. Mobile lint/typecheck pass.
- Native transport probe: real Hermes/Expo clone, push, pull, binary preservation,
  deletion, path containment, external-edit exclusion, and checkout recovery
  pass against disposable loopback repositories. Native cross-launch text
  recovery passes all five phases, including exact frontmatter and preservation
  of conflicting external edits; cleanup passes. This is not live GitHub QA.
- Localization: four English keys translated by `pnpm l10n:translate` into all
  19 Lara targets; the extra Belarusian Latin catalog was updated separately.
  `pnpm l10n:validate` passes all 21 catalogs / 1,199 keys. Product names retained.
- PostHog: no event needed for recovery/error-handling repairs; no new product
  action or mobile consent change. ADRs: none; no dependency/storage redesign.
  Docs: this release record and `docs/ABSTRACTIONS.md`.
- Full desktop/Rust coverage not rerun under the experimental mobile workflow;
  neither Android nor physical iPad nor private GitHub authorization is certified.
  The prior 6,000-file Git performance limitation remains open.

### Simulator Signing Finding

The copied optimized QA executable had been built with
`CODE_SIGNING_ALLOWED=NO`. Its UI and filesystem tests ran, but iOS logged
`-34018`, explicitly reporting no `application-identifier` or
`keychain-access-groups` entitlement. This is a failed credential-storage check,
not an expired GitHub session and not a passing onboarding result.

Build the app through Xcode with simulator signing enabled and
`ONLY_ACTIVE_ARCH=YES`; do not reuse the signing-disabled app for account QA.
The UI-test runner may remain unsigned because it does not own credentials.
Do not add simulator identity values to production app entitlements. A native
vault-manager regression now checks credential restoration, invalid-URL rejection,
and modal dismissal. The normal Xcode signed build passes that regression in
15.383 seconds (`vault-manager-signed.xcresult`), and computer-use inspection
confirms the credential error is absent. Executable and bundle hashes are in
`signed-native-artifact-sha256.txt`. No production entitlement was changed.

Additional manual folder-picker QA exposed a separate existing failure: cancelling
the Files picker leaves the manager busy. This is not a passing folder workflow;
it is the next repair, separate from the verified authentication-request batch.

### Live GitHub Unblock

Provide the **public** OAuth Client ID with Device Flow enabled, or configure
`EXPO_PUBLIC_GITHUB_CLIENT_ID` locally. No client secret belongs in the bundle or
chat. The owner must authorize the device flow and designate a disposable private
repository before live push/pull and divergence testing. No real vault remote
has been modified by these batches.
