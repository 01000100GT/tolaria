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
