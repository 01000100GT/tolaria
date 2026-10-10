# Editor save recovery batch

## Temporary analyzer exception: closing checkpoint

This exception ends with the successful verified push of this documentation
checkpoint on October 10. No further code changes are authorized under it.
The historical approval and batch evidence below are retained for audit, not as
an ongoing waiver. Codacy dashboard/parity and the unavailable MCP safeguard
remain release blockers; the compensating checks did not establish those passes.
Any subsequent UI, authentication, or storage batch requires restored analyzer
access or a new explicitly scoped owner approval.

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

## Native development-build proof collection follow-through

- The rebuilt Debug iPad app emitted all 42 workspace persistence checks to
  Metro, not iOS system logs. The old command therefore failed to collect proof;
  that failure was not treated as a product pass. An independent parse of the
  fresh session established the checks before changing the collector.
- `assert-ios-workspace-persistence.mjs` now accepts `--metro-log`. Its host-only
  reader captures file identity and byte offset before launch, reads at most
  2 MiB of subsequent output, and rejects replacement or detected truncation.
  Selecting Metro never falls back to potentially older system-log evidence.
  The corrected command passes against the freshly rebuilt native app.
- Five filesystem tests pass. A deliberate stale-output mutation makes the
  freshness test fail; the correct implementation was restored and retested.
  The first attempted test command used the wrong working directory and found
  no tests; it is not recorded as a TDD red result.
- Existing script CodeScene 10.0 -> 10.0; both new helper/test files 10.0.
  Three per-file Opengrep scans completed with zero findings at every severity,
  successful invocations, no skipped target, and no partial analysis. The
  script's baseline also had zero findings. Staged CLI delta and normal mobile
  hooks remain required before commit/push.
- Exact code manifest: `apps/mobile/scripts/assert-ios-workspace-persistence.mjs`,
  `apps/mobile/src/qa/nativeMetroProofLog.ts`, and
  `apps/mobile/src/qa/nativeMetroProofLog.test.ts`. Same temporary storage-QA
  exception; no new dependency or ADR. Abstraction inventory updated.
- Localization: no UI copy changes. PostHog: no event needed for host-only QA.
  This is not a replacement for native UI interaction or for verifying the log
  collection paths of other legacy probes. A separate table-command probe did
  not produce proof in this run and remains unverified, not passed.

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

## Complete tag preservation

- Removed the eight-tag cap from both vault snapshot parsing and editable-note
  re-derivation. These are data contracts, not list presentation. Previously the
  properties form received only eight tags and wrote that truncated list back,
  silently deleting later tags when the user added another value.
- Four regressions failed before the fix: initial/summary loading, lazy hydration,
  body-edit metadata, and the actual property-form value conversion/write plan.
  All 79 focused tests now pass. A quoted comma-containing twelfth tag, all prior
  values, unrelated frontmatter, and body bytes survive the form round trip.
  Existing list-specific presentation limits were not changed.
- Existing files start/finish at CodeScene 10.0; the new regression file is 10.0.
  Three-file staged delta reports `no-issues-found`; TypeScript and project ESLint
  pass. Three individual Opengrep scans complete with zero findings at every
  severity, successful invocations, and no target skips or partial analysis.
  Existing scoped baselines were also zero. Remote Codacy remains unavailable.
- This remains frontmatter read/write correctness under the documented temporary
  editor-save exception. No UI copy, analytics, or new dependency; no ADR needed.
  Original vault and demo fixtures are unchanged.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/src/workspace/localVaultSnapshot.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/mobileEditableNote.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/mobileTagPreservation.test.ts` | New | 10.0 | 0 |

## Persisted note metadata refactor

- The frontmatter round-trip audit found the workspace edit orchestrator at
  CodeScene 8.28. Before changing tag behavior, extracted its pure Markdown-to-note
  conversion and field lookup into `mobileEditableNote.ts`. No property, title,
  relationship, or write-plan behavior changes in this checkpoint.
- The same 40 focused editing/hydration/frontmatter tests pass before and after.
  Project TypeScript and ESLint pass. Existing orchestrator: 8.28 -> 10.0; new
  metadata module: 10.0. Staged CodeScene delta reports only fixed findings:
  module size, function count, and duplicated scalar lookup. No regressions.
- Two final individual scoped scans complete successfully without omissions or
  partial analysis. The new file has zero findings. The orchestrator retains its
  three baseline warnings with unchanged fingerprints: two typed internal edit
  dispatch lookups and a regex whose query is escaped before interpolation.
  These unchanged paths accept internal edit discriminants/literal query text,
  not executable remote code. No new finding at any severity and no suppression.
- This frontmatter read/write-contract work is part of the temporary editor-save
  batch, not a broader UI or release exception. Remote Codacy remains unavailable.
  No UI copy or analytics changes; abstraction docs updated; no ADR needed.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/src/workspace/mobileWorkspaceEditing.ts` | Existing | 8.28 -> 10.0 | 3 unchanged warnings |
| `apps/mobile/src/workspace/mobileEditableNote.ts` | New | 10.0 | 0 |

## Native storage probe exclusion

- Added host-only loopback exclusion to the two storage QA entry points. A second
  run fails before fixture creation or simulator termination. No stale lockfile,
  process killing, app runtime dependency, or product behavior was introduced.
- TDD: the missing helper failed first; four behavioral tests now cover exclusion,
  successful reuse, failure cleanup, and closing connections without serving data.
  Both actual scripts were rejected while a lease was held, and the simulator's
  app PID remained unchanged. Sequential native batch restart/conflict recovery
  and the small Git round trip then passed, restoring the 6,036-file app-local
  vault. Other native scripts are not yet guarded and must remain sequential.
- Existing scripts began at CodeScene 10.0 and zero scoped findings. Both scripts
  and both new files finish at 10.0. Project ESLint and TypeScript pass. Four
  explicit Opengrep scans completed with zero findings at every severity,
  successful SARIF invocations, one target each, and no skips or partial analysis.
  CLI staged delta checks all four files. This uses the same limited analyzer
  exception; remote Codacy remains unavailable, not passed.
- No UI copy changes; no PostHog event for test infrastructure; no ADR needed.
  Abstraction docs updated. Original vault and demo fixtures remain untouched.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/scripts/assert-native-git.mjs` | Existing | 10.0 | 0 |
| `apps/mobile/scripts/assert-ios-write-recovery.mjs` | Existing | 10.0 | 0 |
| `apps/mobile/src/qa/nativeSimulatorLease.ts` | New | 10.0 | 0 |
| `apps/mobile/src/qa/nativeSimulatorLease.test.ts` | New | 10.0 | 0 |

## Cooperative Git responsiveness

- Synchronous Expo metadata/mutations now use a small per-instance task runner;
  the Git library's awaited progress callback uses the same policy. Sixteen-
  millisecond slices yield through a timer, concurrent resumptions recheck the
  budget, and genuine asynchronous native reads renew it without an extra timer.
  No metadata cache, weaker rapid-edit staging, or new persistence queue was added.
- TDD first reproduced six adapter scheduling failures, then a concurrent burst
  incorrectly doing all work after one timer, then missing native-IO budget reset.
  All 70 Git tests pass, including same-length rapid edits, real HTTP round trips,
  divergence, failed writes, and fresh metadata. TypeScript and project ESLint pass.
- Optimized native fixture results (6,000 files, Metro stopped):

| Variant | Git work ms | Clone 1 / 2 ms | Push / pull ms | Max JS timer delay ms |
| --- | --- | --- | --- | --- |
| Baseline | 95,409 | 16,565 / 16,645 | 34,302 / 27,892 | 9,112 |
| Initial 8 ms yielding | 159,032 | 28,255 / 28,661 | 54,072 / 48,038 | 412 |
| 16 ms + native-IO reset | 99,075 | 16,948 / 18,070 | 35,280 / 28,769 | 692 |
| Baseline repeat | 97,457 | 17,807 / 17,571 | 34,609 / 27,464 | 9,881 |
| Final repeat | 97,572 | 16,936 / 17,564 | 35,183 / 27,883 | 715 |

- The refined version keeps throughput close to baseline while removing the
  observed multi-second stalls. It still recorded 28 callbacks at least 50 ms
  late (29 in the repeat), so this is not a smoothness, FPS, or release-performance
  sign-off. Two runs per retained variant do not establish device budgets; long
  individual library/native operations are not preempted. The initial variant's
  large slowdown was rejected.
- The two-run mean is 96,433 ms baseline versus 98,324 ms final, about 2% more
  total work time. Worst observed timer delays are 9.1-9.9 seconds versus
  692-715 ms. Repeats ran sequentially with Metro, exports, and test builds stopped.
  Both repeats passed the complete integrity/recovery checks and read the
  original 6,036-file app-local copy without reporting note contents.
- All variants passed binary/deletion/checkout-recovery checks and restored the
  6,036-file app-local vault. The refined version also passes native WYSIWYG
  persistence and 117 measured layout assertions. Native dependencies were unchanged;
  the final iteration reused the verified optimized executable (matching SHA-256)
  with a fresh Expo `--dev false` bundle compiled by Hermes `-O`.
- The same installed optimized app passed all three native XCUITest cases:
  contextual formatting controls, eight continuous panel transitions with
  vertical-scroll arbitration, and repeated rotation preserving the selected
  note and readable editor. The 61.6-second run had zero failures; Metro was off.
- Both existing files began at CodeScene 10.0 and zero scoped findings. All five
  final code files are 10.0; CLI staged delta reports five checked files and
  `no-issues-found`. Five explicit Opengrep 1.26.0 scans each completed 399 relevant
  rules on exactly one file, with successful SARIF invocations, zero findings at
  every severity, no target omission, and no partial analysis. A new test's dynamic
  method lookup was replaced with typed callbacks and rescanned; no rule was silenced.
- This stays within the approved temporary storage/QA analyzer exception. Codacy
  dashboard parity remains unavailable, not zero. ADR 0209 and abstraction docs
  updated; no UI copy, no analytics event for internal scheduling, and no full
  desktop/Rust coverage run. Original Laputa and demo fixtures are unchanged.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/src/workspace/git/expoGitFileSystem.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/git/gitRemote.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/git/gitTaskRunner.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/git/gitTaskRunner.test.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/git/expoGitScheduling.test.ts` | New | 10.0 | 0 |

## Optimized native storage QA checkpoint

- ADR 0208 adds an explicit local `TOLARIA_QA` compilation capability, never a
  default Release flag. The optimized standalone build uses `--dev false` and
  Hermes `-O`; Metro was stopped during its proofs. The separately linked ordinary
  Release executable and module archive contain none of `nativeStorageQAEnabled`,
  `runTextRecoveryProbe`, `runEntryRecoveryProbe`, or `runFileAccessProbe`; the
  flagged executable contains all four. JavaScript also requires the exact native
  boolean outside development mode.
- Native text, entry, and text-batch cross-launch recovery pass in optimized code,
  including frontmatter, completed retries, and external-conflict exclusion. An
  accidentally overlapped text/entry run was discarded and both probes were
  repeated sequentially; only the successful rerun logs count as evidence.
- The optimized 6,000-file Git fixture passes binary/deletion/checkout-recovery
  checks: clones 16,565/16,645 ms, push 34,302 ms, pull 27,892 ms. Git work took
  95,409 ms (97,023 ms including preceding storage checks). Timer sampling found
  16 callbacks at least 50 ms late, with maximum JavaScript delay 9,112 ms. This
  fails the responsiveness goal despite passing data-integrity checks. It is not
  a native animation FPS measurement or physical-device performance budget.
- Capability and timer regression tests began red, then 15 focused tests passed
  including the existing collector checks. TypeScript and project ESLint pass.
  All ten scorable files remain/reach 10.0; staged CLI delta checked all ten and
  reported `no-issues-found`. Baselines were captured for all six existing files.
- Ten individual Opengrep 1.26.0 scans completed successfully, with every result,
  invocation, skipped-target report and partial-analysis report inspected. Nine
  files have zero findings at every severity. `runNativeGitProbe.ts` goes from
  one High plus one Medium to one existing Medium: shared loopback collector use
  removes the raw-fetch diagnostic; the unchanged SHA-1 empty-digest vector tests
  Git compatibility, not security hashing. Its fingerprint is unchanged. No new
  finding, suppression, or ignored target was introduced. New files have zero.
- Same temporary owner-approved storage/QA analyzer exception; remote Codacy
  parity remains unavailable. No UI copy, new analytics event, or full desktop/
  Rust coverage run. Architecture, abstraction and assessment docs updated.
  Original Laputa and demo fixtures remain untouched. Exact code manifest:

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/modules/tolaria-workspace-access/ios/TolariaWorkspaceAccessModule.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceTextRecoveryNativeProof.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceEntryNativeProof.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceFileNativeProof.swift` | Existing | 10.0 | 0 |
| `apps/mobile/src/qa/nativeGitProbe.native.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/qa/nativeStorageQaCapability.ts` | New | 10.0 | 0 |
| `apps/mobile/src/qa/nativeStorageQaCapability.test.ts` | New | 10.0 | 0 |
| `apps/mobile/src/qa/runNativeGitProbe.ts` | Existing | 10.0 | 1 existing Medium (was 1 High + 1 Medium) |
| `apps/mobile/src/qa/measureEventLoopDelay.ts` | New | 10.0 | 0 |
| `apps/mobile/src/qa/measureEventLoopDelay.test.ts` | New | 10.0 | 0 |

## Nonblocking note-read ordering

- Repository note reads now await the existing per-vault operation queue before
  entering synchronous native recovery. The prior implementation immediately
  entered recovery while the same vault's native save could still hold its lock.
  Snapshot reads remain synchronous; no general nonblocking-IO claim is made.
- TDD reproduced two ordering failures. All 26 focused repository tests pass,
  covering active saves, active Git, other-root independence, failed operations,
  cached-content exclusion, and batch persistence. TypeScript passes; native
  WYSIWYG persistence and 117 numeric layout metrics pass on the current binary.
- Existing repository CodeScene remains 10.0; the new test file is 10.0. Staged
  CLI delta checks both files and returns `no-issues-found`. Baseline and both
  final individual Opengrep 1.26.0 scans have zero findings at every severity,
  successful invocations, no skipped target, and no partial analysis.
- Exact manifest: existing
  `apps/mobile/src/workspace/fileSystemWorkspaceRepository.ts`; new
  `apps/mobile/src/workspace/fileSystemWorkspaceReadBarrier.test.ts`.
  The branch merge-base manifest contains 764 tracked changed paths. These two
  files remain inside the approved storage/recovery exception, not a Codacy
  dashboard sign-off. No UI copy/events, new ADR, or full desktop/Rust coverage
  run; abstraction docs updated. Original Laputa and demo fixtures unchanged.

## Repository text-batch integration

- Entirely text-based multi-write plans now use the standalone native batch
  capability. Repeated paths retain final content; mixed structural plans and
  ordinary single saves keep their existing boundaries. Runtimes without the
  native module keep individually queued writes, never a replayable JS loop.
- TDD: seven expected failures preceded implementation; 28 focused repository
  and bridge tests now pass. TypeScript and project ESLint pass. The current-source
  iPad build passes the four-phase cross-launch batch proof: partial replacement,
  all-member recovery/frontmatter, stale-index invalidation, actual repository
  routing (two-member receipt), and external-edit exclusion from reads/writes/Git.
  Native WYSIWYG persistence and its 117 numeric layout measurements also pass.
- Existing file baselines were captured before edits: CodeScene 10.0 (thin text
  bridge unscorable/zero), individual Opengrep 1.26.0 scans zero at every severity.
  Final 12-file reviews preserve those scores; the new QA dispatch was simplified
  to reach 10.0. Staged CLI delta: 12 eligible files, `no-issues-found`.
- Each final Opengrep scan completed successfully with zero Critical/High/Medium/
  Minor/Info/unclassified findings, no skipped target or partial analysis. This
  remains the explicitly approved storage/recovery compensation, not Codacy
  dashboard/analyzer parity or release approval. The merge-base manifest contains
  763 tracked changed paths; this checkpoint is limited to the 12 code paths below.
- No UI copy changes, no analytics event for internal persistence correctness,
  no full desktop/Rust coverage run. ADR 0207 applies; architecture/abstraction
  inventories updated. Demo fixture dirt is empty; original Laputa is untouched.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/modules/tolaria-workspace-access/ios/TolariaWorkspaceAccessModule.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceTextRecoveryNativeProof.swift` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/nativeWorkspaceAccess.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/workspaceTextRecovery.ts` | Existing | No scorable code / 0 findings | 0 |
| `apps/mobile/src/workspace/expoWorkspaceFileSystem.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/fileSystemWorkspaceRepository.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/qa/nativeWriteRecoveryProbe.ts` | Existing | 10.0 | 0 |
| `apps/mobile/scripts/assert-ios-write-recovery.mjs` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/workspaceTextBatch.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/fileSystemWorkspaceBatch.test.ts` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/workspaceTextBatchRecovery.test.ts` | New | 10.0 | 0 |
| `apps/mobile/src/qa/nativeBatchRecoveryProbe.ts` | New | 10.0 | 0 |

## Text-batch engine checkpoint

- The native text engine now journals a complete ordered text plan before its
  first replacement. Preflight checks all members; replay never forces away an
  external edit. Version-one records/receipts remain readable. This checkpoint
  provides the engine; repository routing and its native batch proof follow.
- TDD began with a missing batch API and then reproduced an ancestor-overlap
  ordering bug. All 59 Foundation tests pass, including partial replacement,
  external conflicts, receipt-publication failure, retry identity, and legacy
  compatibility. Native rebuild, existing cross-launch text/entry recovery, and
  conflict blocking pass with the new format.
- CodeScene before/after: the existing engine stays 10.0; both new scorable
  files reach 10.0; Package.swift has no scorable code and zero findings. The
  four-file staged CLI delta returns `no-issues-found`. The two existing files'
  baseline scans and all four final Opengrep 1.26.0 scans have zero findings at
  every severity, successful invocations, no skipped target, and no partial
  analysis. The branch manifest currently contains 758 tracked changed paths;
  only the four code paths below belong to this checkpoint.
- Same owner-approved storage/recovery analyzer exception, expiry, and
  compensating checks. Remote Codacy parity is not established. No full desktop
  or Rust coverage run, no UI copy changes, and no analytics event for this
  internal correctness change. ADR 0207 and architecture/abstraction docs added.
  Original Laputa and demo fixtures remain untouched.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/modules/tolaria-workspace-access/Package.swift` | Existing | No scorable code / 0 findings | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceTextRecovery.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceTextRecord.swift` | New | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceTextBatchTests.swift` | New | 10.0 | 0 |

## Managed metadata path validation

- Profiling showed filesystem reachability calls inside Foundation path
  normalization on every native metadata request. The path boundary now caches
  only the trusted home prefix and validates URI components lexically. The
  descriptor-relative stat still rejects symlinks; no file metadata is cached.
- TDD caught seven normalization/authority acceptance cases before the fix.
  All 52 Foundation filesystem tests now pass. The three existing code files
  below started and finished at CodeScene 10.0. The staged CLI delta checked all
  three files and returned `no-issues-found`.
- Current-source native build and the 6,000-file Git round trip pass, including
  binary/deletion preservation, interrupted checkout, and restoration of the
  6,036-file app-local vault. Total 217,713 ms versus 215,668 ms previously is
  effectively unchanged; this does not establish an additional speedup. The
  direct filesystem validation remains useful without a performance claim.
- Each file's before/after Opengrep 1.26.0 scan completed with zero findings at
  every severity. SARIF invocations and verbose logs show no omitted target or
  partial analysis. Remote Codacy parity remains unavailable under the existing
  owner-approved, temporary storage/filesystem exception.
- No UI copy, analytics event, dependency, persisted format, or new ADR. This is
  an internal path-validation correction and performance follow-through to
  ADR 0205. The abstraction inventory is updated; original vaults are untouched.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/modules/tolaria-workspace-access/ios/ManagedWorkspacePath.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceGitMetadata.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceGitMetadataTests.swift` | Existing | 10.0 | 0 |

## Completed mutation retry follow-through

- Same approved storage/recovery exception, scope and expiry; no release waiver.
  Existing scorable files started and finished at 10.0. The text and entry
  bridge wrappers have no scorable code and zero findings after consolidation.
  The two new scorable files reach 10.0. CLI staged delta checked all 12 code
  files and returned `no-issues-found`.
- TDD reproduced a completed deletion removing a recreated file and a recovered
  save overwriting a later external edit. Foundation: 51 tests pass. Focused
  text/entry bridge, repository, and save-queue tests: 16 pass. Project ESLint and
  TypeScript pass. The full desktop/Rust coverage suite was not run.
- Current-source standalone iPad build passed. Cross-launch text recovery now
  verifies that retrying a completed save preserves a later edit. Entry move,
  deletion, binary/frontmatter preservation, and conflict blocking also pass.
  Native WYSIWYG persistence and 117 numeric layout metrics pass.
- All 12 individual Opengrep scans completed with zero findings at every
  severity, successful invocations, no skipped target, and no partial analysis.
  Existing-file baseline findings were also zero. Project CodeScene remains
  Hotspot 10.0 / Average 9.991289335928062. Dashboard analyzer parity remains
  unavailable, not zero; the approved compensating checks are unchanged.
- ADR 0206 and architecture/abstraction/assessment docs updated. No UI copy
  changes or new PostHog event: this corrects internal retry semantics. Demo
  fixtures and the original Laputa vault remain untouched.

| Exact code path | Batch status | Final CodeScene | Scoped Opengrep findings |
| --- | --- | --- | --- |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceTextRecovery.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceEntryRecovery.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/WorkspaceTextRecoveryNativeProof.swift` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceEntryRetryTests.swift` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/workspaceTextRecovery.ts` | Existing | No scorable code / 0 findings | 0 |
| `apps/mobile/src/workspace/workspaceTextRecovery.test.ts` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/workspaceEntryRecovery.ts` | Existing | No scorable code / 0 findings | 0 |
| `apps/mobile/src/qa/nativeWriteRecoveryProbe.ts` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/ios/TolariaWorkspaceAccessModule.swift` | Existing | 10.0 | 0 |
| `apps/mobile/src/workspace/nativeWorkspaceAccess.ts` | Existing | 10.0 | 0 |
| `apps/mobile/modules/tolaria-workspace-access/tests/WorkspaceTextRetryTests.swift` | New | 10.0 | 0 |
| `apps/mobile/src/workspace/nativeWorkspaceMutation.ts` | New | 10.0 | 0 |

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
