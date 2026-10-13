# Sync reliability: October 13, 2026

## Scope

Owner requested all five improvements: bounded automatic recovery, conflict
resolution, responsive editing during network sync, persistent per-vault status,
and validation of merged metadata. Use disposable vaults and remotes. Laputa is
read-only and must remain unchanged. No production promotion or physical-device
installation is implied by simulator checks.

## Starting gates

- Branch `mobile-ui-foundation`, clean at `ea368bb8f`.
- CodeScene project API: Hotspot 10, Average 9.991507140267476; floors 10 / 9.99.
- Existing `gitMerge.ts`: CodeScene 10, all five local analyzers completed,
  zero findings. Raw evidence: `/Volumes/Jupiter/Cache/tolaria-sync-reliability-20261013`.
- Codacy Cloud tool roster failed twice with `No API token found`. Cloud file
  baselines, analyzer parity, and exact-SHA checks remain unavailable, not zero.
- The owner's existing exception in `ipad-review-2026-10-11.md` covers this
  mobile Git/settings/native/test scope until October 14 at 14:12 UTC. Use local
  file scans, CodeScene CLI delta/API, focused tests and native QA as compensation.
  No suppression, reduced floor, hook bypass or release waiver is introduced.

## Acceptance

1. Retry temporary failures with bounded backoff; do not retry authentication or
   conflicts automatically, and never block editing merely because offline.
2. Inspect affected files and explicitly choose local, remote or keep both;
   reject stale resolutions and preserve originals until safely applied.
3. Freeze and flush editors only around filesystem checkpoints/replacement, not
   network waits; edits made during fetch/push remain pending and are not lost.
4. Restore status per vault; distinguish local saves, local commits, remote
   pushes and provider writeback. Do not claim iCloud delivery is confirmed.
5. Validate proposed merged frontmatter/configuration before updating HEAD or
   user files. Invalid combinations stop safely without publishing.

## Merge validation batch

- Red reproduced an invalid automatic merge containing duplicate frontmatter
  keys. Green: 33 focused Git/metadata tests; mobile TypeScript check passes.
  Tests verify preserved HEAD/index/working bytes, valid custom properties,
  malformed YAML/JSON, saved-view filters, and normal Git transport regressions.
- Manifest: `metadata-manifest.json` in the evidence directory. Existing
  `gitMerge.ts` stays CodeScene 10 / local findings zero. New
  `gitMergeValidation.ts`, `gitMergeValidation.test.ts`, and
  `gitMergeMetadata.test.ts` score 10 and have zero findings across all five
  completed analyzers (20 exact-file analyzer rows total, no errors or skips).
- CodeScene CLI staged delta is the compensating safeguard under the recorded
  MCP exception. Cloud checks remain unavailable, not passing.
- Localization: no UI copy changes. PostHog: no new event needed because this
  adds a safety check to an existing sync action. ADR 0220 and Architecture
  document the validation boundary. Native end-to-end checks follow the UI batch.

## Retry and responsive Git batch

- Red: writes attempted during HTTP fetch/push blocked on the full-operation
  queue. Green: those real HTTP/Git tests now finish, retain typing, and converge
  on a subsequent sync. Editor-boundary tests cover save failure, resume without
  remount, and refresh after uncertain checkout failure.
- Automatic temporary failures return a retry outcome without opening the vault
  dialog. Backoff grows from 30 seconds to a five-minute cap; tests cover recovery,
  disposal, background pause, reconnection and error classification. Thirty-two
  focused tests pass, as does mobile typecheck. Native verification remains due.
- Existing files `gitRemote.ts`, `mobileAutoGit.ts`, `useMobileVaults.ts`, and
  `useWorkspaceAutoSync.ts` have recorded CodeScene 10 / zero local baselines.
  They remain 10 / zero. All five new TS files score 10 with no findings.
  All 45 exact-file TS analyzer rows completed without errors or findings.
  `package.json` remains zero across its four relevant analyzers; CodeScene does
  not score JSON. `responsive-manifest.json` records the full branch and batch.
- Expo Network 8.0.8 is the SDK-54-compatible dependency used only for connection
  events. The initial install hit a pnpm store mismatch; rerunning with the
  existing Jupiter store succeeded. No global package-manager settings changed.
- ADR 0221 and Architecture describe the short write barriers. Localization: no
  UI copy changes. PostHog: existing sync-request event remains sufficient; no
  event is added for each retry because that would create noise.

## Per-vault history batch

- Added validated, serialized per-vault history with pending-file publication and
  backup recovery. Restore interrupted operations as pending. Keep newer edits
  when disk restoration finishes late; deduplicate restoration. Report history
  IO failure without changing vault content. Tests cover independent histories,
  interrupted publication, corrupt state, retries and inherited-key safety.
- The manager shows last success, local commit, pending changes and categorized
  errors. Git completion stays pending when edits occur after its last checkpoint.
  Provider success retains the existing Saved-to-folder wording.
- `status-manifest.json` enumerates the batch and branch. All ten code files
  score CodeScene 10; existing baselines were 10 and zero local findings. Fifty
  local analyzer rows completed with zero findings/errors; staged CLI delta
  reports ten eligible files and no issues. CodeScene parsing/dispatch helpers
  were simplified without suppression. Cloud/MCP exceptions remain as recorded.
- `pnpm l10n:translate` completed all 19 configured Lara targets. The additional
  maintained `be-Latn` catalog was updated in its existing script; all 21 catalogs
  validate against 1,241 English keys. Status and upcoming conflict-screen labels
  are included. No credential or note text is included in history or analytics.
- PostHog: no new event needed for passive status display. ADR 0222 and Architecture
  document persistence. Scoped typecheck/tests pass; native UI checks follow.

## Conflict review batch

- Added in-app local/remote/keep-both review for Git and linked folders. Choices
  are complete and version-checked before publication. Git merges retain both
  parent histories and independent text edits. Synthesized invalid metadata,
  binary, deletion/edit and file/directory cases require explicit choices.
- Linked folders retain both originals and a staged result in app-private
  recovery storage. A publication journal precedes writes; interrupted work
  resumes only while current entries match the reviewed or intended versions.
  New edits stop recovery. A new explicit review can supersede that journal
  without deleting its original snapshots.
- Regression tests reproduced a library checkout bug in file/directory swaps.
  A guarded preparation step uses the existing Git checkout journal, verifies
  original tracked bytes, rejects unknown children and never forces checkout.
- Eleven focused Git conflict tests and twenty linked-folder Swift tests pass,
  including interruption and stale-comparison cases. Native checks passed below.
- The Mac is locked, so direct computer-use interaction is unavailable. The
  native XCUITest/headless simulator lane remains available; no attempt is made
  to unlock the Mac. Physical iPad remains disconnected.
- Existing-file baselines: CodeScene 10, zero local findings for the touched
  native bridge/session, manager, hook, native access types, checkout recovery,
  and analytics. Package.swift is declarative/unscorable with no warnings.
- Localization: updated conflict guidance translated with Lara to all configured
  targets; additional maintained be-Latn copy updated. Analytics uses the existing
  mobile Git/folder sync-request events with operation `resolveConflicts` only.
  ADR 0223, Architecture and the UI parity inventory record the implementation.

## Final verification and release record

- All five scoped improvements are implemented. The mobile suite passes 258
  files / 1,511 tests. Scoped mobile lint/typecheck and normal commit/push hooks
  are the branch gates; the desktop/Rust full suite and coverage were deliberately
  not rerun under the established experimental-mobile workflow. This is not a
  production release or a new coverage claim.
- Built and installed a Release-mode native iPad simulator app with the QA flag.
  `TabletSyncConflictTests` taps the real native manager, inspects both versions,
  verifies disabled continuation before a choice, a >=44-point choice target,
  comparison bounds, keep-both, and persisted local commit after relaunch. The
  final single-test XCUITest run passed. Host-side Git inspection confirmed both
  parents, both exact file versions and a clean index. This is native app QA,
  not Safari or React Native Web. No keyboard shortcut changed in this batch.
- Final native evidence: `native-final/verified-conflicts.xcresult` and its
  exported attachments. The first application-only screenshot API clipped a
  landscape capture; the final test captures `XCUIScreen.main` and records native
  bounds (1376 x 1032 points). Both comparison columns and controls fit visibly.
  One intermediate test-runner compile failed while correcting that capture API;
  the final runner compiled and passed. An earlier accidental duplicate test
  action reused an already-resolved fixture; the fresh single-action runs passed.
- `assert-native-background-sync.mjs` passed against a disposable HTTP Git
  remote: actual AppState background, editor flush, frontmatter retention,
  merge and push. Its native folder proof passed coordinated writeback and the
  added linked-folder conflict keep-both/next-sync-clean check. Native keyboard
  typing during HTTP waits was not separately automated; real HTTP unit tests
  verify concurrent writes during fetch/push and subsequent convergence.
- The simulator fixture helper restored the original catalog/settings byte for
  byte and removed every disposable review vault. All 6,036 Laputa files matched
  their original SHA-256 hashes. Demo-vault Git status is empty. No user-vault
  commit/push, credential change, physical-device install or Android check ran.
- Conflict-batch manifest: `conflict-manifest.json`, regenerated immediately
  before commit from the full branch diff and untracked paths. Its 27 exact
  code/config paths have 116 completed local analyzer rows, all zero at every
  severity, with no errors or missing relevant runs. This includes a separate
  Biome run for the MJS harness, which the CLI routing omits. Complete findings
  and identities are in `conflict-analyzer-rows.json`; existing zero baselines
  stay zero. One new Biome optional-chain warning was fixed and rescanned.
- Every scorable conflict-batch file finishes at CodeScene 10.0. Declarative
  Package.swift and diff3.d.ts are unscorable with zero warnings. Existing 10.0
  baselines remain 10.0. Native bridge and checkout helpers were split to retain
  the gate. CLI staged delta supplies the unavailable MCP safeguard under the
  recorded exception; project API remains Hotspot 10 / Average
  9.991507140267476, above the unchanged 10 / 9.99 floors.
- Codacy Cloud remains unavailable, not zero or passing. The existing owner
  exception covers missing cloud baseline/parity/exact-SHA evidence and expires
  October 14 at 14:12 UTC. Production promotion still requires restoring those
  gates. The CodeScene MCP substitution has the same recorded scope/expiry.
- Localization: Lara translated the conflict guidance and no-conflicts copy to
  all 19 configured targets; maintained be-Latn was updated separately.
  `pnpm l10n:validate` passes all 21 catalogs / 1,242 keys. PostHog resolution uses
  `mobile_git_operation_requested` or `mobile_folder_sync_requested` with
  `operation: resolveConflicts`; no file path, content or credentials are sent.
- ADRs 0220-0223, Architecture and UI parity inventory are updated. Linked-folder
  conflict snapshots intentionally remain in private recovery storage; automatic
  retention cleanup is not included. OS background time remains best-effort,
  and provider writeback never claims confirmed iCloud upload.
