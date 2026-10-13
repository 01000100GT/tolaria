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
