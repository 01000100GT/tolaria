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

Background batch and final native verification:

- Added one shared lifecycle adapter for Git and linked-folder scheduling,
  immediate departure flush, in-flight joining, native execution leases and
  transport cancellation. Manual Git remains manual. Local commits now precede
  credential refresh/network access. A denied/expired lease defers work; genuine
  errors and conflicts retain the existing visible retry controls.
- Red/green: `background-red.log`, `background-green.log`, `lease-red.log`,
  `lease-green.log`, `cancellation-green.log`. The focused Git/lifecycle/folder
  checks pass 150 tests / 37 files; Foundation tests pass 76 tests. Mobile lint
  and typecheck pass. No desktop/Rust coverage or full desktop suite was run.
- ARM64 optimized iOS Simulator build passes with the explicit local-only
  `TOLARIA_QA` flag. `native-background-final-proof.log` passes all assertions:
  independent local/remote commits merged with two parents; a pending editor
  draft was flushed, committed and read back from the actual smart-HTTP remote
  while AppState was `background`; linked-folder write-back preserved the draft
  and frontmatter. Folder storage used a wholly isolated home/bookmark store.
  `assert-native-background-sync.mjs` switches the simulator to Settings after
  the probe reports ready. This is the native app, not a browser. Interactive
  computer-use was unavailable because the Mac was locked; no unlock or security
  bypass was attempted. No physical iPad or cross-device iCloud test is claimed.
- CodeScene: all 22 background-batch code paths are 10.0 except Package.swift,
  which is unscorable without findings. Existing scores stay at 10.0; new files
  reach 10.0. The staged CLI delta is the compensating safeguard; MCP/cloud
  limitations remain those recorded above. No generated bundle was changed.
- Codacy: `background-analyzer-matrix.json` records 99 successful per-file/tool
  rows with exact identities and zero findings at every severity. TypeScript:
  Biome 2.5.6, ESLint9 9.39.5, Opengrep 1.26.0, Trivy 0.72.0, Lizard 1.23.0.
  Swift: Opengrep, Trivy, Lizard. The MJS runner is routed to the latter three
  plus ESLint9; Codacy does not route MJS to Biome, so a separate explicit Biome
  2.5.6 lint of that exact path confirms 1 file checked, 0 errors/warnings/info,
  0 skipped (`background-script-biome.json`). This is 100 completed analyzer
  results, not a silently skipped target. Cloud parity is still unavailable.
  The QA collector reuses the existing validated loopback sink; no rule bypass.
- Exact branch inventory: `branch-manifest-background-commit.txt`; scoped file
  classifications and analyzer evidence are retained in the evidence directory.
  Existing touched files remain zero; every new file is zero. The old SHA-1
  probe finding noted in the baseline is in an untouched file.
- Localization: no UI copy changes. PostHog: existing Git sync events cover the
  operation; no new event is needed for lifecycle-driven repetition or QA.
- Refactoring: shared lifecycle hook replaces duplicated foreground hooks;
  separated QA dispatch and lifecycle predicates retain CodeScene 10.0.
  ADR 0219 and ABSTRACTIONS document finite background execution and limitations.
- Hygiene: `native-integrity-final.json` verifies all 6,036 Laputa files unchanged,
  no additions/removals, identical settings/catalog bytes and no probe residues.
  Host Laputa was not touched. The physical iPad is disconnected; these new
  merge/background changes have not been installed there.
