# Mobile resumption assessment

Assessment started 2026-10-10. Target: iPad and Android tablets, phone later.

## Current checkpoint

- Follow-through is underway: recoverable Git checkout now passes real write-fault
  and restart tests, including the standalone iPad filesystem. Incomplete checkout
  cannot be edited or checkpointed as new user content. Standalone iOS text saves
  now have atomic publication and restart recovery, with external-edit exclusion.
  Standalone moves/deletions also have replay and atomic relocation. Text-only
  multi-file plans have roll-forward recovery; mixed structural plans still do not.
- Current-source standalone iPad app rebuilt and installed. Native touch tests
  cover panel transitions, contextual formatting menus, and repeated rotation
  while preserving the selected note. Native WYSIWYG persistence plus 117 layout
  metrics, and the all-panels fixture's 181 metrics pass with the compact toolbar.
- The latest completed mobile gates pass 1,262 tests across 205 files; 59 Swift
  filesystem tests passed in the native storage batch. No full desktop suite ran.
- Public GitHub cloning, persisted vault selection, and real native Git
  push/pull against a disposable server work. The simulator uses an isolated
  6,036-file Laputa copy, not the original vault.
- Not launch-ready: the optimized 6,000-file fixture takes 29-35 seconds for
  manual pull/push. Cooperative scheduling reduced the observed worst JS stall
  from 9.1-9.9 seconds to 692-715 ms across two runs per variant, but this is
  still not a release budget. Linked
  original folders, configured/live GitHub
  authentication, Android device QA, and October-main integration remain open.
- A subsequent native form diagnostic fails: the software keyboard covers the
  Create View footer. This is a confirmed remaining UI defect, not covered by
  the passing shell/toolbar/rotation checks above.
- The table and evidence below are chronological, starting with the recovered
  baseline; later batches supersede the earlier observations.

### Repository text-batch follow-through

The native journal is now connected to entirely text-based multi-write plans,
including repeated-path coalescing. Unsupported runtimes retain individual queue
retries. The standalone iPad was terminated between the first replacement and
recovery; all intended note bytes/frontmatter recovered, while an external edit
blocked read/write/Git without losing the pending plan. The proof also verifies a
two-member receipt from the actual repository path, not only a direct engine call.
Mixed move/backlink plans and keystrokes not yet submitted remain outside this
guarantee. Focused tests, native build, and the 12-file quality gates pass under
the same documented temporary analyzer exception.

### Read-only desktop contract spot check, October 10

Compared `origin/main` at `ec8a3c21942bfb43a2f65eec6fcdcf18f6d95b23`
with `apps/mobile/src/ui/desktopParity.ts`. Sidebar item padding is 6 points
vertically / 12 left / 16 right (8 right with count); group headers use 8 vertical
/ 12 left / 14 right (8 with count). Folder indentation remains 25 points. Note
rows use 14 vertical / 16 horizontal, with 13 left plus a 3-point typed selection
border. Those inspected values match the desktop sources in `sidebarStyles.ts`,
`folderTreeLayout.ts`, and `NoteItem.tsx`. H4 is 17 points, not the inventory's
previous 20-point description; mobile code already has the correct value.

This is a limited source comparison, not a new screenshot approval or complete
October desktop parity. Numeric native layout checks protect rendering, but the
expected values and mobile constants are still duplicated. Consolidating the
desktop-owned contract remains open, as do newer desktop behavior differences.

### Remaining hydration error handling

The frontmatter audit also reproduced and fixed silent loss of tags after the
eighth value when editing the tags property. Initial snapshots and subsequent
hydration/editing now retain every tag; the actual form conversion/write-plan
round trip has regression coverage. The edit orchestrator was first refactored
from CodeScene 8.28 to 10.0 without changing behavior.

`useHydrateSelectedNote` in `useTabletWorkspaceController.ts` attaches a success
handler to `readNoteContent` without a rejection handler. A storage recovery
conflict can therefore reject asynchronously without a user-facing retry/recovery
state; the render error boundary does not cover that promise. The save/read guards
protect bytes but do not finish the UX. Track this for the UI/controller batch;
do not silently substitute empty content or remove the conflict guard.

### Next batch acceptance checks

1. Fix keyboard-aware form sizing first (native reproduction below), then finish
   the recovery UX using existing Tolaria components. A rejected selected-
   note read must leave the draft intact, expose a recovery action, and never
   fall through to an editable empty note. A failed sync must distinguish local
   save failure, unavailable network/authentication, and divergent history.
   Prove retry and vault switching in the native app after injected failures;
   checking the filesystem guards alone is not sufficient.
2. Exercise the complete ingest-to-sync path. Configure the public GitHub client
   ID, then verify device authorization, cancellation, private clone, restart,
   local edit, remote edit, and manual sync without exposing credentials or note
   content in logs. Until this is configured and tested, public/disposable Git
   round trips are not evidence that private-account onboarding is ready.
   Include stalled-response coverage: `githubRequest.ts` currently clears its
   30-second timer after response headers, before `response.json()` completes.
   The authorization/repository-list body therefore lacks that deadline; keep
   cancellation and timeout active through body consumption in the auth batch.
3. Connect the existing provider-file foundation to live-folder selection only
   after revision-aware reads/writes, bookmark restoration, external changes,
   dirty-editor conflicts, and coordinated structural mutations are covered.
   Test an actual iCloud/provider folder on a device. The current importer makes
   an app-local copy; Android still needs its own SAF permission/storage adapter.
4. Continue tablet UX verification: table insertion/row/column editing, property
   forms with the keyboard open, focus restoration, interrupted drags, split-
   screen, and VoiceOver. Require native measured bounds plus human-style taps
   and drags. Fix the table-command proof's missing result before counting it as
   coverage; the standalone formatting-menu pass does not verify table mutations.
5. Integrate current desktop main in a dedicated checkpoint before expanding
   parity. The inspected remote main is `ec8a3c219`; it has 176 commits absent
   from this mobile branch at this checkpoint. Consolidate desktop-owned tokens
   instead of adding another copied expected-value table, and rerun the native
   numeric/UI contract after integration. This session did not perform that rebase.
   A non-mutating `git merge-tree` assessment reports 28 conflicting paths:
   21 locale catalogs, localization lock, package/workspace manifests and lock,
   ignore rules, the ADR index, and `noteListHelpers.ts`. Preserve the native
   SDK's dependency constraints and the extracted shared sorting behavior while
   incorporating main's newer fixes; resolving markers alone is not validation.

Each implementation batch should keep its own small verified commits and scoped
checks, then end at an explicit device-review checkpoint. Preserve the current
native fixtures and actual-device distinction; no browser-only acceptance.

### Final native checkpoint, October 10

- Current JavaScript (including full tag preservation) was bundled with Expo
  `--dev false` and compiled with Hermes `-O`. The verified optimized native
  executable was reused unchanged; this is not a second full native rebuild.
- With Metro stopped, native WYSIWYG persistence and 117 measured layout checks
  pass; the separate all-panels fixture passes 181 metrics. The three native
  XCUITest cases pass with zero failures (85.1 seconds),
  covering contextual formatting, continuous panels, and repeated rotation.
  A portrait test attachment was visually inspected as supplementary evidence.
- A separate fresh Debug rebuild passes all 42 native workspace persistence
  checks through the corrected fresh-only Metro log collector. Five new reader
  tests pass; a stale-log mutation fails its regression test as intended.
- The final scoped mobile push passes lint, TypeScript, 1,262 tests, web export,
  and project CodeScene Hotspot 10.0 / Average 9.991289335928062. Web export is
  a build gate, not a substitute for any of the native checks above.
- Repeated optimized 6,000-file runs reproduce both performance and integrity:
  baseline 97,457 ms / 9,881 ms maximum JS delay, final 97,572 ms / 715 ms.
  Two-run means including the earlier pair are 96,433 ms versus 98,324 ms.
  This does not establish animation FPS or physical-device release budgets.
- Physical-device/Android QA, hardware keyboard delivery, full production
  coverage, and remote Codacy parity remain unverified. The host was locked;
  native automation was usable, but interactive host computer-use was not.
- The final simulator launch is the standalone native app on the real app-local
  Laputa copy, with Metro stopped. The original `~/Laputa` and both demo fixture
  directories are clean. No original-vault note was changed or pushed.
- Release record: this assessment and `editor-save-recovery-batch.md` contain
  the chronological manifests, analyzer results, native evidence, ADR references,
  and remaining limitations. This is a verified experimental-branch checkpoint,
  not release approval; the temporary storage analyzer exception closes with
  its final documentation push and does not cover the next UI/auth batch.

### Confirmed keyboard occlusion, not fixed

Native XCUITest opens `actionSheet=createView` on the optimized iPad app, taps
`workspace-create-view-name-input`, types a name, and checks the real keyboard and
Create button frames. The first run included iOS keyboard onboarding; a repeat
visually confirmed the normal software keyboard and reproduced the same failure.

- App bounds: 1376 x 1032 points. Sheet: x=368, y=60.5, width=640, height=880.
- Input: x=385, y=148, width=606, height=33. The 16-point inner padding plus
  one-point border and the 640-point sheet width match the source contract.
- Keyboard top: y=585.875. Create button: y=888..924, height=36,
  `isHittable=false`. The native assertion that the button ends above the keyboard
  fails. This is not inferred solely from a screenshot.
- `MobileWorkspaceActionSheet.tsx` sizes long forms from window height and uses
  an absolute overlay without keyboard avoidance. Its existing CodeScene score
  is 10.0. The correction should use the app's keyboard-avoidance convention,
  constrain the sheet to available height, and retain a scrollable body and
  reachable footer; validate both long and short forms, rotation, and dismissal.
- Source contracts also permit 30-point property choices and 32-34-point filter/
  suggestion rows. Audit their actual touch regions before claiming tablet
  accessibility; do not enlarge desktop-derived visual tokens indiscriminately.
- No production UI file was changed: the unavailable required Codacy dashboard
  and MCP safeguard need restored access or a separately approved UI-batch
  exception. The storage-only exception was not expanded automatically.
- Diagnostic source, native failure logs, accessibility hierarchy, screenshots,
  and recordings are retained under
  `/Volumes/Jupiter/Cache/tolaria-mobile-qa-2026-10-10/`, notably
  `TabletFormDiagnosticTests.swift` and
  `final-form-diagnostic-normal-keyboard.xcresult`. This disposable diagnostic is
  separate from the three passing repository-native tests, not a passing release gate.

## Recovered baseline

The task reopened at detached June commit `ca79c12ff`. The maintained August
implementation was recovered from `origin/mobile-ui-foundation` (`c97be7326`).
The divergent older local branch is preserved as
`backup/mobile-local-before-resume-2026-10-10`. No desktop work was discarded.

The simulator's installed standalone app predates that branch. It is not valid
evidence for the current source. Current-source native checks use Expo Go 54;
custom native-module changes require a rebuilt development app, separately.

## Assessment

| Area | Current evidence | Decision |
| --- | --- | --- |
| Desktop visual language | Shared parity tokens, explicit native layout styles, native note selection and properties toggle work | Keep; do not redesign from Bear screenshots |
| Editor | TenTap WYSIWYG with Markdown/frontmatter serialization and extensive model tests | Keep; add an awaitable save barrier before checkout or switching vaults |
| Tablet panels | PanResponder event ownership was recomputed during drag; animation interruption used settled rather than presented positions | Fix correctness; native UI-thread gesture recognition is still needed for predictable performance |
| Native gestures | Automated coordinate drags have not yet established reliable continuous manipulation | Not passed; screenshots and transition-model tests are insufficient |
| Local folders | iOS picker copies into Documents; imported copy cannot track later iCloud edits | Separate import from live-folder access; never advertise the copy as cloud sync |
| Native persistence | Filesystem writes work, but some operations silently return on invalid paths; many reads are synchronous | Harden error handling and serialize writes with Git before enabling checkout |
| Remote sync | No Git implementation or GitHub login in the recovered branch; local snapshots report Synced | Launch blocker; use a real library and explicit local/pending/synced/error states |
| Android | No Android workspace module or current emulator evidence | Not validated; do not infer readiness from iOS or web |
| QA | Many pure-model and web tests, numerous native probes, but historical artifacts are temporary paths | Record current native evidence and numeric layout checks per batch |
| Build reproducibility | Fresh pnpm install failed native bundling because NativeWind's JSX Babel plugin was undeclared | Declare it directly; verify both native bundle and web export |

## Delivery order

1. Reproducible tablet baseline and core interaction corrections.
2. Embedded Git, safe checkpoints, real HTTP round-trip tests, credential isolation.
3. Vault manager and native storage integration, save/checkout barrier, honest sync UI.
4. Live-folder provider access: durable iOS scope/coordinated IO and persisted Android
   SAF permissions. External changes must refresh without overwriting dirty notes.
5. Tablet usability pass with representative data: keyboard, scroll/drag arbitration,
   rotation, split-screen, modal sizing, text sizes, touch targets, and accessibility.
6. Device validation and measured large-vault budgets before launch promotion.

### Approved follow-through

- [x] Recover interrupted Git checkout before reopening or checkpointing.
- [ ] Reduce measured large-vault sync cost without missing rapid edits.
- [x] Restart recovery for published standalone iOS text saves.
- [x] Restart recovery for standalone iOS file/folder moves and deletions.
- [ ] Whole write-plan recovery and incremental startup.
- [x] Contextual native formatting toolbar with measured touch targets.
- [ ] Tablet properties/forms touch polish.
- [x] Native tablet rotation preserves the selected note and readable editor width.
- [ ] Gesture interruption/selection tests, split-screen layout, and focus restoration.
- [ ] Live provider folders, configured GitHub login, and actionable sync recovery.
- [ ] Consolidated shared design tokens and parity audit against current desktop.
- [ ] Release-device performance budgets, accessibility, and Android tablet QA.

The first recovery batch started at Hotspot 10.0 / Average 9.991289335928062.
All touched/new code remains 10.0. Scoped Git tests passed 45 assertions, and the
standalone iPad proof verified real interrupted checkout, read/write exclusion,
retry, binary/deletion preservation, and remote round trips. Codacy reviewed the
existing loopback QA callback, Git SHA-1 test vector, and non-security catalog ID
suffix findings; no new security defect was introduced. No UI copy changed and
no analytics event is needed for internal recovery guards. See ADR 0201.

The next filesystem batch reuses bounded native path handles (never cached bytes
or timestamps), and enumerates directory names through Expo's supported async
API instead of constructing every child as a native File. The identical 6,000-file
fixture passed: clones 41,640/54,714 ms, push 75,298 ms, pull 68,296 ms, total
241,985 ms. Previous total was 404,585 ms. These are single debug-simulator runs,
not release budgets; metadata calls still dominate the sampled native profile.
Three adapter tests verify fresh metadata/content, byte views, path containment,
and filesystem errors. Both adapter files score 10.0. Codacy's nine audit findings
are non-literal paths in the disposable Node test adapter, not production file
access defects; none were suppressed. No copy/analytics changes.

Manual Git sync is the first scope. Divergence stops with both histories intact;
no forced pushes or hidden conflict resolution. Background sync, rich on-device
conflict editing, multi-vault use, and phone polish are not first-launch prerequisites.

### Contextual toolbar batch

- Four primary formatting actions plus heading/list/insert/more menus replace the
  native WYSIWYG command strip. Table commands appear only in table context. The
  source toolbar and existing command semantics remain unchanged (ADR 0202).
- RNR primitives own dropdown behavior. Native tap QA reproduced an iOS
  accessibility grouping bug that hid individual items; the wrapper now exposes
  each command. XCUITest then passed heading application, selected-state reporting,
  outside dismissal, a second menu, and subsequent inspector toggling. Existing
  eight-transition panel drag coverage also passes: two tests, 59.7 seconds.
- Native numeric layout check: 181 metrics passed. Native WYSIWYG persistence
  and its 117 metrics passed. Controls measure 44 x 44 points, menus at least
  44 points per row. These are explicit tablet touch exceptions, not invented
  desktop padding. No browser check is substituted for the native results.
- CodeScene: native layout assertions 8.03 -> 8.28; other touched/new scorable
  files 10.0. The command-data module and Ruby generator have no scorable code
  and zero findings. Scoped Codacy Opengrep: 15 files, zero findings.
- Lara translated the four menu labels into 19 targets; Belarusian Latin was
  updated too, and validation passes all 21 catalogs. Mobile analytics remains
  intentionally disabled pending consent/settings integration; no note content
  or account data was instrumented. Demo and original user vaults are unchanged.
- VoiceOver traversal, Android, physical devices, and the rest of the approved
  adaptive-layout/form work remain unverified. This is not launch sign-off.

### Tablet resize correction

- A real iPad rotation test first failed: launch-time panel defaults left the
  editor below its existing 520-point minimum after rotating to portrait. Window
  resize now hides left panels in order and preserves the selected note. Growing
  does not reopen dismissed panes. Closing the inspector also validates the
  restored pane arrangement against the new width.
- The same native regression passed after the fix, including repeated rotation
  and inspector toggling. Pure resize/transition/screen-mode coverage passes
  32 tests. An active drag session is invalidated on resize; interrupted physical
  drags and split-screen window switching still need their own native tests.
- All four touched/new scorable files reach 10.0; the existing gesture hook stays
  10.0. Scoped Codacy reports no findings. No UI copy or analytics changes are
  needed for this correction. No new ADR or storage change; abstraction inventory
  updated. Only disposable fixture notes were used in the rotation test.

## Evidence log

- Cooperative Git scheduling: after rejecting an 8 ms variant's 159-second total,
  the 16 ms/native-IO-reset variant takes 99,075 ms versus 95,409 ms baseline, with
  maximum JS timer delay 692 ms versus 9,112 ms. Both retain native data-integrity
  checks. All 70 Git tests and native WYSIWYG persistence/117 layout metrics pass.
  These are single optimized simulator runs, not physical-device budgets. See
  ADR 0209 and the exact per-file storage-batch record.

- Optimized native baseline (Metro stopped, production Hermes bundle): the
  6,000-file fixture passes, with 16.6/16.6-second clones, 34.3-second push and
  27.9-second pull. Maximum timer scheduling delay is 9,112 ms, not acceptable
  responsiveness. Native single/entry/batch recovery also passes. Ordinary
  Release's linked native binary excludes the opt-in storage probe API. See
  ADR 0208 and the storage batch record; these are simulator measurements.

- Text-batch engine: a version-two journal retains every member of a published
  text-only plan. All 59 Foundation tests pass, including recovery from partial
  replacement and conflicts. The current iPad build retains single-save and
  structural recovery behavior. Repository integration/native multi-note proof
  are the next checkpoint; mixed structural plans remain outside this guarantee.

- Metadata path follow-through rejects normalization aliases and credentialed
  file authorities before accessing the filesystem. All 52 Foundation tests and
  the current-source standalone 6,000-file Git probe pass. Total 217,713 ms versus
  the prior 215,668 ms is effectively unchanged, not another proven speedup.
  CodeScene remains 10.0 for all three files; scoped scans have zero findings.

- Native retry regression: actual filesystem tests reproduced a completed
  deletion removing a recreated file and a recovered text save overwriting a
  later edit. UUID receipts are now checked before reading fresh preconditions.
  The Foundation suite passes 51 tests; 16 focused bridge/repository tests pass.
  The current-source iPad restart proof also preserves the later external edit
  when the completed save is retried. See ADR 0206 and the batch evidence record.

- Single-call native metadata: the same 6,000-file Git fixture passed before
  and after the adapter change. Baseline clone times were 67,859/86,065 ms,
  push 79,310 ms, pull 73,596 ms, total 309,756 ms. New times were
  40,324/60,842 ms, push 64,774 ms, pull 47,825 ms, total 215,668 ms.
  These are single debug-simulator runs with host-load variance, not release
  budgets. Binary/deletion/checkout recovery checks remain green. Fresh metadata,
  timestamp changes, managed path boundaries, and symlink rejection have focused
  coverage; the Foundation suite passes 47 tests. See ADR 0205.

- Structural recovery: 43 Foundation tests and six standalone iPad cross-launch
  phases pass. Folder moves retain binary/frontmatter data; interrupted deletion
  has no partial visible tree; external changes block replay and Git. UUID-based
  completion receipts fix read-recovery followed by queue retry. All 17 code
  files pass the CLI delta and scoped security scan; see the recovery batch record.

- Text-save batch: 1,200 scoped mobile tests, 29 Swift filesystem tests, current
  standalone build, cross-launch recovery/conflict probe, normal native Git
  round trip, and WYSIWYG persistence plus 117 numeric layout metrics pass.
  Per-file CodeScene reaches 10.0 (unscorable files have zero findings). The
  explicitly approved temporary analyzer exception and per-file scoped scan
  evidence are in `editor-save-recovery-batch.md`; dashboard parity is not claimed.

- Starting CodeScene project scores: Hotspot 10.0, Average 9.991289335928062;
  branch thresholds 10.0 and 9.99 pass.
- Gesture regression tests were first observed failing for interrupted offsets
  and properties stealing drags outside its bounds; then passed after fixes.
- Git tests use disposable actual Git repositories, not mock object graphs.
  Clone/push/pull, divergence preservation, rejected-push retry, file deletion,
  frontmatter preservation, and binary-byte preservation pass locally.
- Native Expo Go 54 current bundle renders sidebar rows, note rows, properties,
  and WYSIWYG content. Clicking a note changes the editor and inspector; the
  properties button toggles the panel. Continuous drag remains under investigation.
- Codacy ESLint wrapper lacked its TypeScript parser and is not counted as a
  successful scan. Project ESLint passes. Codacy Opengrep succeeds with UTF-8
  locale settings and reports no findings in the first core implementation scan.

## Second batch

- Committed Git foundation: `ccb2b8a30`. Verified hooks passed 1,121 mobile tests.
  Real Git subprocesses explicitly remove inherited `GIT_*` settings; hooks had
  previously contaminated the disposable HTTP fixture's repository discovery.
- Replaced tablet PanResponder with Gesture Handler/Reanimated worklets. No
  per-frame React state or JavaScript-thread movement callbacks. Preserved existing
  dimensions, toolbar actions, and the left strip's sequential snap points.
- Native Expo Go 54 layout assertion passed **204 metrics** on the booted iPad Pro
  13-inch simulator, using the current Metro bundle and all-panels fixture.
- Instrumented native input during CUA drag attempts: a touch-down arrived but no
  touch-move callbacks followed. This does not establish a real gesture pass.
  Temporary logging was removed. Physical-touch interaction remains unverified.
- Moved the dependency store's `v10` cache to
  `/Volumes/Jupiter/Cache/tolaria-pnpm-store-internal-v10-20261010` with a symlink
  at its original location, preserving it and recovering internal disk space.
  Removed only temporary repositories created by this run.

## Native Git batch

- `node apps/mobile/scripts/assert-native-git.mjs` creates a disposable smart-HTTP
  Git server and starts the current bundle in Expo Go on the booted simulator.
  The in-app probe is development-only and accepts only a loopback test endpoint.
- Actual Hermes/Expo filesystem clone, commit, push, and pull passed on iPad:
  frontmatter, binary bytes, a nested attachment, and deletion survived the round
  trip. The small fixture completed in 1,837 ms; this is not a large-vault budget.
- Native-only fixes: provide the global Buffer required by the Git library;
  convert Buffer subclasses to plain Uint8Array at Expo's JSI write boundary;
  report missing parents as ENOENT; normalize harmless `.` path segments while
  still rejecting traversal outside the working copy.
- Touched code remains CodeScene 10.0; the Buffer initializer has no scorable code
  and zero findings. No UI copy or analytics changes in this internal batch.

This is a working assessment, not a release-readiness declaration. Native Git
transport is proven for a small fixture, not live GitHub authentication, large
vault throughput, Android, or file-provider behavior.

## Save-boundary batch

- Added ordered failed-write retention, shared with Git's actual-root operation
  key. Tests prove failed saves stop checkout and retries do not replay successful
  mutations or overwrite newer edits with older content.
- Added awaitable editor preparation and stale-reply suppression. TenTap freezes
  input before its final JSON read; source editors flush and freeze their draft.
  The registry still needs wiring into the vault-manager sync owner.
- Native workspace persistence passed. Native WYSIWYG persistence and 140 layout
  assertions passed after fixing the probe to wait for TenTap readiness, rather
  than relying on a 1.5-second startup assumption.
- Source editor CodeScene improved from 8.87 to 9.68 by separating its style
  groups; remaining touched/new code is 10.0. Scoped Opengrep: zero findings for
  the save boundary. The earlier native Git probe scan flags its proof POST as
  potential SSRF; reviewed as a development-only, loopback-validated fixture
  callback with generated data and no credentials or user-vault access.
- No UI copy changes or analytics events: these are internal persistence fixes.

## Vault-manager batch

- Native Expo Go cloned `isomorphic-git/lightning-fs` over real GitHub HTTPS from
  the new vault manager. The README opened in TenTap, a full app restart restored
  the vault, and reading the note left its working copy clean. No remote push was
  attempted against that public repository.
- A nonexistent-repository clone returned a visible error and preserved the
  previous vault and selected note. The local filesystem catalog contains only
  the successfully cloned vault; failed clone directories are removed.
- Catalog publication retains a validated backup. Regression tests cover an
  interrupted publish and an unrecoverable corrupt catalog. Authentication tests
  cover late restoration, cancelled authorization, and sign-out during listing.
- The sync owner now uses the editor/disk barrier. After replacement, callbacks
  from an old workspace generation cannot write. An edit clears the last sync
  success; local folders no longer claim remote synchronization.
- CodeScene: source editor 9.68 -> 10.0, keyboard shortcuts 8.45 -> 9.38;
  other touched code remains 10.0 and new scorable code reaches 10.0.
- Localization: Lara translated 19 configured targets; the existing Belarusian
  Latin catalog was also updated. Validation passes all 21 catalogs.
- Scoped Codacy Opengrep reviewed 56 files: two audit findings. The generated
  vault suffix is not a credential or security boundary (exclusive directory
  creation rejects collisions); shortcut dispatch uses a closed action union,
  and untrusted key lookup now uses Map to exclude inherited object properties.
  Neither finding represents a new Critical/High security defect.
- PostHog is intentionally not enabled in this experimental mobile build: mobile
  consent/settings integration is absent. No vault, account, or note data is sent
  as analytics. Instrumentation remains a release-readiness task.
- GitHub sign-in remains unverified and explicitly unavailable without
  `EXPO_PUBLIC_GITHUB_CLIENT_ID`. Live folders, Android, and large-vault sync
  performance remain open work, not implied by the public clone success.

## Filesystem safety batch

- A native regression first reproduced silently successful moves when the source
  was missing or the destination already existed. These now reject without
  changing either file. Mutation paths reject traversal and `.git` access.
- The repository validates the complete write plan before queuing it, rejects a
  missing root, and awaits asynchronous filesystem operations before Git can
  read the working copy. Targeted repository coverage: 14 tests passed.
- The same assertions run inside the native Git probe, which passed in Expo Go
  on the iPad simulator (1,758 ms for the small disposable round trip).
- No UI copy or analytics changes; this is persistence correctness, not a new
  user action. Live file-provider access still requires the standalone build.

## Standalone QA and provider-file foundation

- Built and installed the current-source standalone iPad app, rather than testing
  the old August binary or substituting the browser for native QA.
- Reproduced a standalone QA harness failure: JavaScript persistence proofs were
  visible in Metro but absent from the iOS unified log. The loopback collector now
  carries both metrics and known proof events. The standalone app passed all 140
  layout assertions and the native WYSIWYG save/persistence proof after this fix.
- Added a Foundation-only Swift package: nine real-filesystem tests cover atomic
  writes, SHA-256 revision checks, external edits/deletions, create collisions,
  special and Unicode filenames, symlinks, traversal, and bookmark restoration.
  The DEBUG-only native bridge can run disposable iOS file-access checks too.
- This is storage groundwork, not a live-folder feature claim. Picker integration,
  refresh/indexing, directory mutations, and conflict recovery remain required
  before exposing original provider files to editing (ADR 0198).
- The Mac locked during unattended work. Interactive CUA QA stopped; simulator
  instrumentation and builds continued without attempting to unlock it. No
  additional continuous-gesture verification is claimed.
- Android setup is absent: no SDK/emulator and only an old x86 Java 8 runtime.
  Android tablet QA remains a separate required gate.
- Touched and new scorable files score 10.0. Scoped Codacy found only the already
  reviewed development-loopback Git proof callback warning, not a new security
  defect. No UI copy changed; no product analytics event is appropriate for this
  internal QA/storage groundwork. Demo fixtures and the original Laputa vault
  remain untouched.
- Standalone iOS verification passed all five file-access checks plus the real
  Git round trip (2,634 ms for the disposable fixture). Restoring the existing
  app-local copy measured 6,036 files: 1,414 ms native read and 1,601 ms JavaScript
  snapshot construction. These are debug-run baselines, not a release performance
  budget or proof of fast large-vault Git sync. No original vault files were read
  or written during this measurement.

## Folder access disclosure

- The vault manager now distinguishes the standalone local-copy importer from
  Expo Go's session-only access to original files. It no longer promises that
  Expo Go edits cannot affect the original folder.
- A failing legacy managed importer rejects instead of falling back to the
  original picked root. The regression reproduced that fallback before the fix;
  all nine picker tests pass afterwards. Native picker cancellation still keeps
  the current vault.
- The new warning was translated with Lara into all 19 configured targets; the
  existing Belarusian Latin catalog was updated too. This is a safety correction,
  not a new user action requiring a product analytics event.

## Native launch source correction

- Final simulator inspection caught fixture notes after a `source=native` launch.
  The URL resolver recognized only `native-vault` and defaulted every unknown
  source to fixtures. Four failing cases reproduced this and inherited-object
  lookup for `constructor`/`__proto__`.
- Source lookup now uses Map, accepts `native`, and defaults unknown native
  launches to the real repository. Explicit fixtures and isolated QA routes still
  work. All 19 resolver tests pass. The corrected simulator launch shows the
  imported Laputa copy with 5,867 open entries and 169 archived entries.
- No localization or product analytics changes for this launch-routing fix.

## Read and import safety

- Reproduced empty-content fallback for invalid text, silent missing-root reads
  on iOS, and import/restore failures being mistaken for cancellation or first launch.
  These now reject. A staged import must validate fully before replacing the
  previous managed folder; visible symlinks and recursive self-import are rejected.
- Extracted the native index/import functions for real-filesystem testing. All
  17 Swift tests pass, including preserving the previous vault after invalid imports.
  The rebuilt standalone app passes the invalid-text proof, missing-root checks,
  and the actual Git round trip (1,981 ms for the small disposable fixture).
- Added a workspace error boundary with vault-management recovery controls. Failed
  reads cannot leave a blank editable document or remove access to vault selection.
  React DOM recovery coverage and the focused bridge/repository tests pass.
- Touched/new scorable files remain 10.0. Scoped Codacy Opengrep reports zero
  findings. Existing localized recovery copy is reused; no new product analytics
  event is appropriate for this data-safety correction. Original Laputa and demo
  fixtures remain untouched. Live provider integration is still not enabled.

## Repeatable native gesture verification

- A fresh standalone XCUITest runner passed eight actual panel transitions plus
  vertical-pan non-collapse in 31.9 seconds. It asserts native editor positions
  at x=600, x=340, and x=0, and a 300-point inspector, using actual touch synthesis.
  This supersedes the earlier inability to deliver continuous drag events via CUA.
- Caught and corrected two QA-harness problems: querying `isHittable` on an absent
  element caused retries/timeouts, and Xcode reused an old unsigned runner after
  rebuilding. The committed runner checks existence first and reinstalls itself
  before every run. Tolaria app data is never removed.
- The repository command, not only the temporary prototype, passed. Final native
  WYSIWYG persistence and all 140 layout assertions also passed on the rebuilt app.
  These results do not establish animation frame rate, interrupted drags, text
  selection arbitration, Android, or physical-device behavior.
- New scorable QA files score 10.0; the Ruby project generator has no scorable code
  and no findings. Codacy's sole audit warning is the credential-free loopback
  Metro status request, not remote unencrypted traffic; redirects are rejected.
  No UI copy or analytics changes. ADR 0199 records the additive native QA lane.

## Native Git scale and rapid-edit safety

- Added an opt-in 6,000-file generated fixture (~24 MB of content) to the native
  Git harness. It never copies user notes or contacts a user's remote repository.
- Before optimization, the standalone debug run passed correctness but took
  90,863 / 154,789 ms for its two clones, 117,549 ms for push, and 108,908 ms
  for pull (473,850 ms total). This is not acceptable as a launch performance target.
- A Hermes CPU profile showed JavaScript hashing and garbage collection. Expo
  Crypto now provides native digest support without replacing existing crypto
  APIs. A library-owned cache is scoped to each sync, rather than repeatedly
  reading immutable packs. The read-budget regression failed at three reads and
  now passes at one.
- A separate deterministic regression caught equal-length edits being omitted
  from checkpoints when timestamps did not advance. Checkpoints now explicitly
  stage file content before inspecting the matrix. This prioritizes correctness
  over the library's metadata shortcut; large-vault costs must include that work.
- The standalone app was rebuilt with Expo Crypto. The small native round trip
  and all six native file-access checks pass (1,516 ms for the Git fixture).
- Follow-up: clone 64,398 / 98,890 ms; push 116,589 ms; pull 122,913 ms;
  total 404,585 ms. All content/binary/deletion checks pass. Cloning improved,
  but sync is still around two minutes and **remains a launch blocker**. A second
  profile points to filesystem info calls and URI/object construction. The native
  digest's known SHA-1 vector was also verified directly on Hermes.
- These are individual debug-simulator runs, with sampled profiling, not release
  device latency guarantees. Do not claim light-speed sync from these results.
- New/touched scorable files are 10.0; the native initializer has no scorable code
  and no findings. Final scoped Codacy reports two reviewed QA warnings: the
  development-only, loopback-validated proof callback, and SHA-1 on a fixed empty
  input to verify Git's required digest. Neither is used to hash credentials or
  accept arbitrary remote destinations; no rule was suppressed. The rapid-edit
  fix has zero findings. No UI copy
  changed; no product analytics event is appropriate for internal performance
  and data-safety fixes. ADR 0200 documents the dependency and cache lifetime.

## Remaining integration limits

- This branch has not been rebased onto the October `main` tip. The recovered
  mobile baseline is August; reconcile shared desktop contracts in a separate
  verified integration batch before promotion. The inspected desktop color-token
  diff adds editor selection colors, not a wholesale palette change.
- Desktop-derived mobile constants have parity checks, but are still mirrored
  definitions rather than a single generated cross-platform design-token source.
- GitHub authenticated login needs a configured public OAuth client ID and live
  verification. Public cloning and local-server authenticated-independent Git
  transport proofs are not a substitute for testing a user's private repository.
- Linked original folders need picker/refresh/conflict integration and real
  provider QA. The current standalone picker intentionally remains copy import.
