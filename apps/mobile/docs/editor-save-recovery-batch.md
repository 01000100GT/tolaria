# Editor save recovery batch

## Temporary analyzer exception

- Approved by repository owner Luca in this task: "yes you can" (2026-10-10).
- Scope: this mobile editor-save recovery batch only, not release approval or a
  permanent gate change. Expires 2026-10-13 at 17:35 UTC; review/remove the active
  exception at batch completion, and no later than 2026-10-17.
- Blocked: `mcp__codescene__pre_commit_code_health_safeguard` is absent from the
  available tools (checked twice). CLI/API access works.
- Blocked: `codacy tools gh refactoringhq tolaria --output json` failed twice with
  "No API token found". Dashboard baseline/parity/post-push checks are unavailable.
- Blocked: `.codacy/cli.sh analyze apps/mobile/src/workspace/git/workspaceWriteQueue.ts
  --format sarif` failed twice: ESLint 9.39.5 cannot parse the TypeScript type
  declaration; missing language configuration also sends TypeScript to Pylint.
  Zero SARIF results from an unsuccessful analyzer are not a passing scan.
- Risk: remote analyzer parity and complete Codacy coverage are not established.
- Compensating checks: CodeScene CLI before/after file reviews and delta review,
  project API thresholds, project ESLint/TypeScript, scoped security scans,
  deterministic filesystem fault tests, and standalone native iPad verification.
  Hooks remain enabled; no thresholds or analyzer rules are weakened.
- Affected scope: mobile workspace repository/filesystem/save queue, the local
  iOS workspace module, their tests and QA probes, and associated documentation.
  The final manifest and actual results are recorded below before commit.
- Starting project CodeScene: Hotspot 10.0, Average 9.991289335928062; floors
  10.0 and 9.99. Existing scorable files start at 10.0; Package.swift has no
  scorable code and zero findings.

## Scope

Protect text-note and local configuration saves in the standalone iOS app with
atomic replacement and a persistent recovery record. Recover before indexing,
reading, editing, or syncing. Preserve the recovery record and reject replay if
the destination changed unexpectedly. Recovery records stay outside vaults and
must never enter Git commits.

This is not a general multi-file transaction journal, live-folder integration,
Android crash-safety implementation, or a guarantee for keystrokes that have not
yet reached the save boundary. Expo Go cannot load custom native storage code.

## Text-save verification record

Text-save checkpoint committed and pushed as `f6f5f8cce` with normal mobile hooks.
Post-push CodeScene project state remains Hotspot 10.0 / Average
9.991289335928062. The CLI staged delta inspected all 19 code files and reported
`no-issues-found`. The original temporary exception remains limited to this
storage/recovery follow-through; it is not authorization to waive release gates.

- TDD: observed missing native recovery type/bridge and two stale-index regression
  failures before implementation. Final scoped mobile suite: 1,200 tests in 193
  files; TypeScript and project ESLint pass. Swift: 29 real-filesystem tests pass.
  The full desktop/Rust coverage suite was intentionally not run on this branch.
- Current-source standalone iPad build succeeded. A six-phase native probe
  terminated/relaunched the app between publication and replay; recovered complete
  frontmatter, discarded the stale index, and preserved external edits while
  rejecting reads, later writes, and Git. The probe's collector URL was corrected
  before this pass; it now uses the existing loopback proof endpoint.
- Normal standalone native Git round trip also passes (1,980 ms small fixture):
  binary bytes, deletion, interrupted checkout, and restored 6,036-file app-local
  vault. Native WYSIWYG persistence and 117 numeric layout metrics pass.
- CodeScene per-file review: every scorable file 10.0, unscorable files zero
  findings. Read-snapshot and probe helpers were simplified to restore 10.0.
  CLI staged delta substitutes for the unavailable MCP under the exception above.
- Local security: Opengrep 1.26.0 with the existing 1,408-rule configuration,
  one explicit file at a time. Every SARIF result and invocation was inspected.
  Three Swift tests were initially excluded by the repository's `tests/` ignore;
  they were rescanned with `--x-ignore-semgrepignore-files`, retaining all rules.
  The repeat logs show no skipped targets or partial analysis and zero findings.
  TypeScript/JavaScript are additionally checked by the project's actual ESLint
  configuration. This is NOT Codacy analyzer parity or dashboard verification.
- All zero counts below mean Critical/High/Medium/Minor/Info/unclassified are zero
  for the completed scoped Opengrep scan. Existing files started at zero.
  Dashboard counts remain unavailable, not zero.
- Localization: no UI copy changes. PostHog: no event needed because this is an
  internal persistence-correctness change, not a new user action.
- ADR 0203; architecture and abstraction inventories updated. Demo fixture dirt
  is empty; the original Laputa vault was not modified.
- The branch-wide merge-base manifest was enumerated (735 paths, including prior
  mobile batches); this approved batch's 19 code paths are listed below.
  This record is not a branch-wide Codacy or production release sign-off.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/modules/tolaria-workspace-access/Package.swift` | Existing | No scorable code / 0 findings | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/TolariaWorkspaceAccessModule.swift` | Existing | 10.0 | 0 |
| `apps/mobile/src/qa/nativeGitProbe.native.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/expoWorkspaceFileSystem.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/fileSystemWorkspaceRepository.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/git/workspaceWriteQueue.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/nativeWorkspaceAccess.ts` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/ManagedWorkspaceText.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceTextRecovery.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceTextRecoveryNativeProof.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/ManagedWorkspaceTextTests.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceTextRecoverySafetyTests.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceTextRecoveryTests.swift` | New | 10.0 | 0 |
| `apps/mobile/scripts/assert-ios-write-recovery.mjs` | New | 10.0 | 0 |
| `apps/mobile/src/qa/nativeWriteRecoveryProbe.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/fileSystemWorkspaceRecovery.test.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/git/workspaceWriteRecovery.test.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/workspaceTextRecovery.test.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/workspaceTextRecovery.ts` | New | No scorable code / 0 findings | 0 |

## Git filesystem metadata follow-through

Within the approved workspace-filesystem follow-through, replace repeated Expo
attribute lookups with an optional native stat capability. No metadata/content
cache, dependency, UI, save-barrier, or rapid-edit correctness change was added.
The analyzer exception above remains temporary and is not release approval.

- Native TDD: missing metadata reader, then a real `/var` alias failure, before
  the sandbox-descriptor fix. Foundation: 47 tests passed. Three new adapter
  checks plus existing adapter/rapid-edit checks: seven tests passed.
- Current-source standalone iPad build and small Git round trip pass. Identical
  6,000-file fixture: before/after total 309,756/215,668 ms; push
  79,310/64,774 ms; pull 73,596/47,825 ms. Binary/deletion preservation and
  interrupted-checkout recovery pass. Debug host-load variance remains; these
  timings are not a release budget and sync is still too slow.
- Project CodeScene remains Hotspot 10.0 / Average 9.991289335928062. All eight
  scorable files remain/reach 10.0; Package.swift is unscorable with zero findings.
  Staged CLI delta checked all nine code files and returned `no-issues-found`.
- Nine individual Opengrep 1.26.0 scans completed with zero results at every
  severity. Each SARIF invocation and verbose skip/partial-analysis report was
  inspected. All existing files started at zero; every new file also has zero.
  Project ESLint and TypeScript pass. Codacy dashboard/parity remain unavailable,
  not zero. The merge-base manifest has 753 paths; this batch's scope is below.
- Localization: no UI copy changes. PostHog: no event needed for internal
  filesystem performance. ADR 0205 and architecture/abstraction docs updated.
  No original vault or demo fixture changes. Native interactive CUA remains
  unavailable while the Mac is locked; native instrumented tests were used.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/modules/tolaria-workspace-access/Package.swift` | Existing | No scorable code / 0 findings | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/ManagedWorkspaceText.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/TolariaWorkspaceAccessModule.swift` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/nativeWorkspaceAccess.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/git/expoGitFileSystem.ts` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/ManagedWorkspacePath.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceGitMetadata.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceGitMetadataTests.swift` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/git/expoGitMetadata.test.ts` | New | 10.0 | 0 |

## Structural recovery follow-through

- Same approved storage/recovery scope and exception expiry. Existing files'
  baseline reviews/scans are unchanged from the verified text-save checkpoint:
  10.0 / zero findings (Package.swift unscorable). No gate was lowered or skipped.
- Native entry operations now publish durable intent and use exclusive atomic
  rename. Deletions first quarantine a whole tree outside the vault. A bounded
  completion receipt and native-generated operation UUID make queue retries
  identifiable after read-side replay, without treating a new command as a retry.
- TDD reproduced missing structural recovery, two missing-source retry failures,
  and a new-command/old-receipt ambiguity before fixes. Final Foundation suite:
  43 tests passed. Targeted JavaScript repository/queue/bridge checks: 21 passed.
  TypeScript and project ESLint pass.
- The current-source standalone iPad build passed six cross-launch entry phases:
  published move, recovered move with binary/frontmatter/index preservation,
  quarantined deletion, recovered deletion, prepared external edit, and blocked
  replay/sync preserving the source and journal. No browser result is substituted.
- CodeScene: all scorable touched/new files 10.0; Package.swift has no scorable
  code and zero findings. The staged CLI delta checked all 17 files and returned
  `no-issues-found`. Refactoring consolidated duplicate fault tests and separated
  probe dispatch; no production behavior was weakened to satisfy the gate.
- Scoped security scans: 17 individual Opengrep 1.26.0 scans with all existing
  rules and test ignores disabled. Every SARIF result/invocation and verbose
  skip/error report was inspected. All completed with zero findings at every
  severity, no skipped target, and no partial analysis. The entry engine was
  rescanned after its final UUID change. Remote Codacy remains unavailable.
- Native interactive CUA inspection was attempted, but the Mac is locked.
  No unlock was attempted; the native cross-launch automation remains usable.
- Localization: no UI copy changes. PostHog: no event needed for internal
  persistence correctness. ADR 0204 and architecture/abstraction docs updated.
  This is still not multi-file transaction recovery or release approval.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceEntryFingerprint.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceEntryNativeProof.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceEntryRecovery.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceMutationCoordination.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceEntryRecoverySafetyTests.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceEntryRecoveryTests.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceEntryRetryTests.swift` | New | 10.0 | 0 |
| `apps/mobile/src/qa/nativeEntryRecoveryProbe.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/workspaceEntryRecovery.test.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/workspaceEntryRecovery.ts` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/Package.swift` | Existing | No scorable code / 0 findings | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/TolariaWorkspaceAccessModule.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceTextRecovery.swift` | Existing | 10.0 | 0 |
| `apps/mobile/scripts/assert-ios-write-recovery.mjs` | Existing | 10.0 | 0 |
| `apps/mobile/src/qa/nativeWriteRecoveryProbe.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/expoWorkspaceFileSystem.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/nativeWorkspaceAccess.ts` | Existing | 10.0 | 0 |
