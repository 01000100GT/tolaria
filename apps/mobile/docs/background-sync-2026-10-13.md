# Mobile Merge and Background Sync: October 13, 2026

## Scope and starting gates

Implement conflict-free Git integration and a bounded save/sync attempt when
leaving the foreground, for opt-in AutoGit and linked iOS folders. Never use
Laputa as a writable fixture. Work stays on `mobile-ui-foundation`.

- CodeScene project baseline: Hotspot 10.0 / Average 9.991507140267476;
  floors 10.0 / 9.99. Existing candidate code files score 10.0; Package.swift is
  unscorable without warnings. Evidence is retained in
  `/Volumes/Jupiter/Cache/tolaria-background-sync-20261013`.
- The existing owner-approved Git/workspace analyzer exception recorded in
  `ipad-review-2026-10-11.md` applies, expiring October 14 at 14:12 UTC.
  `codacy tools gh refactoringhq tolaria --output json` failed again and on retry
  with `No API token found`; CodeScene MCP tools are unavailable. Cloud analyzer
  parity and exact-SHA results remain unavailable, not passing or zero.
  Risk, approver (Luca), expiry and compensating checks remain unchanged:
  per-file local analysis, CodeScene review/delta, focused tests and native QA.
  No production promotion, suppressions, lowered gates or hook bypass.
- Baseline local scans explicitly target candidate files with the existing
  no-exclusions test configuration. All are clean except the pre-existing
  SHA-1 capability probe finding in `runNativeGitProbe.ts`; it is not a clean
  baseline. That probe is not yet changed. The full before-change branch
  inventory is `branch-manifest-before.txt`; there were no untracked files.

## Installation handoff

The preceding linked-folder Release build at `50f9b1b5e` was successfully signed
and installed in place on the physical iPad at 12:31 UTC. The device disconnected
before launch verification; no launch or physical iCloud QA is claimed.
Evidence: `physical-install.json` and `device-final-signing-retry.log` in
`/Volumes/Jupiter/Cache/tolaria-icloud-folder-20261013`. No uninstall or data reset.

## Work and verification

Merge batch:

- Implemented three-way text merge, conservative binary/conflict handling,
  journaled merge publication and at most three attempts after a rejected push.
- Red/green evidence: `merge-red.log`, `merge-safety-red.log`, `merge-green.log`.
  Focused Git checks pass 128 tests in 33 files. Mobile typecheck passes.
- Code manifest: existing `apps/mobile/src/workspace/git/gitVault.ts`,
  `apps/mobile/src/workspace/git/gitRemote.ts`,
  `apps/mobile/src/workspace/git/gitRemote.test.ts`; new
  `apps/mobile/src/workspace/git/gitMerge.ts` and
  `apps/mobile/src/workspace/git/gitMerge.test.ts`.
- CodeScene: existing files stay 10.0; both new files reach 10.0. Local Codacy
  Biome 2.5.6, ESLint9 9.39.5, Opengrep 1.26.0, Trivy 0.72.0 and Lizard 1.23.0
  each completed for each exact path: 0 Critical, High, Medium, Minor, Info or
  unclassified findings, 0 errors. Existing zero baselines stay zero.
  Per-file `*-cs-merge.json` and `*-codacy-merge.json` retain complete evidence.
  CLI staged delta passes; unavailable MCP/cloud checks remain under the above
  exception and are not represented as passing.
- Localization: no UI copy changes. PostHog: existing
  `mobile_git_operation_requested` already measures this sync action; an
  additional automatic-merge event would add noise, so none is added.
- Refactored integration into validation, merge-object creation and recoverable
  publication to retain code health. ADR 0218 and ABSTRACTIONS document it.
- Native merge/lifecycle checks and the background batch are still pending.
  No desktop/Rust coverage or production promotion is claimed.
