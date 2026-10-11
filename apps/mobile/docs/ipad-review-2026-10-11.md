# Physical iPad Review: October 11, 2026

## Scope and acceptance

Implement the twenty review items on `mobile-ui-foundation`. The physical-device
review supersedes historical Done labels in `feedback-tracker.md`. An item is
complete only after focused behavioral checks and native layout/interaction
evidence; browser rendering alone cannot establish native correctness. Keep
desktop semantics and design tokens unless the owner explicitly requested a
mobile adaptation. Use isolated vault copies and disposable remotes for QA.

## Extended analyzer exception

- Approver: Luca, repository owner, explicitly extended the prior exception to
  these twenty changes in this chat on October 11, 2026.
- Recorded: 2026-10-11 14:12 UTC. Expires: 2026-10-14 14:12 UTC, or earlier when
  analyzer access returns. Review and remove within seven days; no release waiver.
- Blocked command: `codacy tools gh refactoringhq tolaria --output json` failed
  twice with `No API token found`. Cloud file baselines, analyzer parity and
  exact-commit dashboard verification are unavailable, not passing or zero.
- CodeScene MCP safeguard/change-set tools are absent from two tool-inventory
  checks. Use supported CLI file review/delta and project API as compensating
  evidence; do not report unavailable MCP calls as passing.
- Scope: mobile UI, editor, keyboard, workspace metadata/views, Git/settings,
  theme, shared desktop-derived tokens/models as needed, associated focused
  tests, native test modules, localization and architecture documentation. Record
  exact touched paths for each commit before scanning. No unrelated desktop work.
- Risk: local scanners cannot prove cloud parity or exact-SHA dashboard results.
  No suppressions, weakened thresholds, forced pushes or production promotion.
- Compensating checks: before/after per-file CodeScene and local Codacy, staged
  change review, project health floors, scoped mobile lint/typecheck/tests,
  native simulator interaction/layout checks and isolated Git integration tests.
- Starting CodeScene: Hotspot 10.0, Average 9.991289158049293; floors 10.0 / 9.99.

## Checklist

| # | Requested result | Status |
| --- | --- | --- |
| 1 | One-tap copy of GitHub device authorization code | Implemented; native live device-code copy/cancel check passes |
| 2 | Searchable, aligned, scrollable repository picker for large lists | Implemented with virtualized rows; search tests pass; authenticated native picker QA pending |
| 3 | Panel backgrounds/dividers extend through top safe area; footer through bottom safe area | Implemented; native screenshot verified |
| 4 | Editor-focused arrow keys never change selected note | In progress |
| 5 | Restore desktop-style editor slash commands | Pending |
| 6 | Inline find in note, with visible match navigation/highlighting | Pending |
| 7 | Desktop-compatible type discovery, plural labels and custom sidebar names | Implemented; model tests and native type navigation pass |
| 8 | Saved views apply their actual persisted filters | Implemented; parser and native filtered navigation pass |
| 9 | Discoverable property addition, aligned backlinks, adding values to existing relationships | Implemented; native relationship-add and inspector checks pass; real-vault backlink QA pending |
| 10 | Breadcrumbs use the note's configured type icon and color | Implemented; native typed icon verified |
| 11 | Favorite and other local actions respond without avoidable delay | Bounded flag edits and lazy settings suggestions implemented; native model timings recorded |
| 12 | Rich-editor formatting commands match source-editor capabilities | Implemented shared tablet strip; native formatting test passes |
| 13 | Right-aligned breadcrumb actions and a reduced overflow menu | Alignment verified natively; overflow reduction pending |
| 14 | Tablet UI approximately ten percent larger while retaining hierarchy | Implemented; native Standard/Larger numeric geometry, persistence and rotation pass |
| 15 | Explain and verify local Git and remote sync behavior | Native disposable-remote probe passes; explicit manual commit verified on disk |
| 16 | Type-visibility picker has properly aligned native option rows | Implemented; native measured regression passes |
| 17 | Visible sync controls/status, automatic Git and manual commits with user messages | Implemented; native manual commit/settings persistence pass; automatic remote UI QA pending |
| 18 | Essential settings chosen from an audit of desktop settings | Git, appearance, UI density and opt-in privacy settings implemented; native persistence checks pass |
| 19 | Note-row swipes: favorite on left, delete/archive on right; full swipe favorites or archives, never deletes | Implemented; two native tablet tests pass; phone QA pending |
| 20 | Desktop-matched dark mode throughout native chrome, dialogs and editor | Implemented; native pixel, persistence, inspector/dialog and source-editor checks pass |

Sidebar type-selection latency belongs to item 11. The earlier bottom-safe-area
clarification belongs to item 3. Panel drags must not consume item 19's row
gestures. Preserve explicit panel toggles. Git currently checkpoints local edits,
fetches, fast-forwards or pushes without force, and stops on divergence. This
existing implementation is not proof of working user-facing iPad sync.

## Batch evidence

Record exact files, baseline/final analyzer results, regression tests, native
measurements, commits and remaining limitations as each batch completes.

### Saved views and sidebar types

- Red: two type-discovery/pluralization regressions and seven YAML compatibility
  regressions failed before fixes. Green: 33 focused tests across saved views,
  YAML parity and sidebar parity pass; 22 sidebar/snapshot tests also pass.
- The filesystem integration fixture now uses the desktop's canonical filter
  schema, with an explicit one-note match assertion; all 11 repository tests
  pass. Its CodeScene remains 10 and all five local analyzers report zero.
- Desktop compatibility: 155 command-registry and sidebar tests pass.
- `mobileSavedViews.ts`: CodeScene 10 -> 10; local Codacy 2 -> 0 (one Biome High,
  one Warning removed with the handwritten parser).
- `mobileSavedViews.test.ts`: CodeScene 10 -> 10; local Codacy 35 -> 0
  (non-null assertion warnings replaced by an explicit fixture assertion).
- `mobileSidebarSections.ts`: CodeScene 10 -> 10; local Codacy 0 -> 0.
- `src/hooks/commands/typeCommands.ts`: CodeScene 10 -> 10; local Codacy 0 -> 0.
  Its unchanged pure pluralization moved into new `src/shared/typeLabels.ts`
  (CodeScene 10, zero local findings), avoiding a mobile dependency on desktop
  command/UI types. The desktop export remains compatible.
- New `mobileViewYaml.ts`, `mobileViewYamlParity.test.ts` and
  `mobileSidebarParity.test.ts`: CodeScene 10, no warnings; local Codacy zero.
- Paths above are under `apps/mobile/src/workspace/`. Each file was scanned
  separately with Biome 2.5.6, ESLint9 9.39.5, Opengrep 1.26.0, Trivy 0.72.0 and
  Lizard 1.23.0; every tool reports success, one file analyzed, zero final findings
  at every severity and no errors. Stylesheet-only tools were not routed to TS.
- `apps/mobile/package.json` adds the already-locked YAML 2.8.3 dependency;
  `pnpm-lock.yaml` changes only its mobile importer. ADR 0210 and
  `docs/ARCHITECTURE.md` document the parser boundary.
- Evidence and complete branch/untracked manifests:
  `/Volumes/Jupiter/Cache/tolaria-ipad-review-2026-10-11/`.
- Localization: no UI copy changes. PostHog: no event needed because these fixes
  restore existing type navigation and view filtering, not new user actions.
- Native integration and exact-SHA cloud verification are not claimed here.

### Native layout and controls

- First verified commit: `694a3e1e1`; mobile lint, typecheck and all 1,320
  scoped mobile tests passed. Staged CodeScene delta: no issues, nine files
  checked. No full desktop/Rust suite was run.
- iPad Release simulator: saved view Active Procedures shows only its single
  matching procedure; switching back to All Notes restores all three fixture
  notes. Type visibility toggles update the actual sidebar.
- `TabletReviewLayoutTests`: red before rebuild, green after rebuild, two tests.
  Native picker rows measure 52 points high, at least 250 wide, separated by at
  least 4 points. Existing-relationship add opens its correctly keyed picker.
- Native screenshots confirm panel backgrounds and dividers continue through the
  status-bar area, and the footer background continues under the home indicator.
  Breadcrumb type icon is green for Essay; actions align at the right edge.
- The keyboard root controller no longer gives bare arrows priority over text
  input and excludes them while a native text responder is focused. Manual CUA
  hardware-keyboard input confirms Up moves from the third rich-text line to the
  second, with a typed marker appearing there and no selected-note change.
  XCUITest `typeKey` did not reliably deliver Command-A/arrows to this simulator;
  its experimental test was discarded, not reported as passing. Source-editor
  manual verification and post-edit persistence remain in the final QA batch.
- GitHub authorization-code copying and repository picker are implemented;
  repository search has three behavioral tests. An authenticated native session
  has not yet verified those two controls. No authentication code is logged.
- Localization: Lara translated the five new keys into all 19 configured target
  locales; the additional Belarusian Latin locale is maintained explicitly.
- Native-controls batch file manifest is `native-controls-manifest.txt` in the
  evidence directory. All touched scorable files remain at CodeScene 10; the
  declarative parity inventory is unscorable with no findings. Each new code
  file scores 10. Each TypeScript file reports five successful local analyzers,
  one target each, zero findings at all severities and no errors; the Swift
  layout test reports successful Semgrep, Trivy and Lizard with zero findings.
  Existing zero baselines remain zero; MobileUiLab's one Info finding is fixed.
  Locale files are translated data, validated across all 21 catalogs, not
  executable configuration. Cloud checks remain unavailable under the exception.
- PostHog: no new event needed for repairs to existing controls, navigation and
  styling. No note content, credentials or repository names are instrumented.

### Editor controls and note gestures

- Tablet rich and source editors share the horizontally scrollable formatting
  strip with 44-point controls and active-format states. The focused native
  formatting test passes, including headings, quote/math discovery and panel
  toggle preservation. Phones keep their compact formatting strip.
- Native row swipe tests failed before implementation and both pass in the
  Release iPad simulator: partial left swipe exposes Delete and Archive without
  moving panels; full right toggles Favorite; full left archives rather than
  deletes, with the note recoverable in Archive.
- Parent panel gestures yield to note rows and editor interiors. Panel controls,
  list headers, sidebar surfaces and edge gestures remain available. Pure
  regression tests protect gesture ownership and the full-swipe threshold.
- Every scorable touched/new code file in this batch scores 10 with no CodeScene
  warnings. Type-only/inventory files have no scorable code and no findings.
  Individual local scans have zero findings and successful completion from all
  five TypeScript or three Swift analyzers. Evidence files end in `-after.json`
  and `-after-cs.json`; `editor-gestures-manifest.txt` records exact paths.
- ADR 0211 records gesture ownership and supersedes ADR 0202's tablet toolbar
  decision. ABSTRACTIONS documents the shared formatting and swipe components.
- Localization: existing translated commands reused; no new UI copy.
- PostHog: gesture adoption instrumentation remains part of the consent-aware
  mobile settings work before release; do not treat this batch as releasable.
- The generated TenTap HTML exceeds the local analyzer's 150 KB limit on both
  attempts. No change to that generated file has been made; additional owner
  approval was requested for source-scanning/build/native-QA compensation.

### Local interaction performance

- Favorite, archive and organized edits derive the target once, preserving
  unrelated note identities, relationships and timestamps. A 1,000-note fixture
  regressed from 1,004-1,006 document parses per flag edit to at most four.
  Hydration retains its existing reconciliation path and custom frontmatter.
- Closed view/type/list settings no longer calculate their suggestions. Open
  and archived counts use one unsorted pass and are memoized across selection
  renders. Navigation dispatch now uses Maps rather than inherited object keys;
  its two baseline Semgrep Error findings are removed without suppression.
- Three new navigation/suggestion regressions failed before the fix and pass
  afterward. The focused navigation/flag/hydration set has 19 passing tests.
- Native Release benchmark on the already imported 6,036-note app-local copy:
  favorite model update 33 ms; type filtering/counts 18 ms for 853 matches.
  These are model timings, not tap-to-paint claims. The probe does not write its
  throwaway edit result. Native mouse interaction also verified type navigation
  and visible favorite/sidebar updates.
- Native Git probe before/after passes clone, checkpoint, push, pull, binary and
  deletion preservation, checkout recovery and external-edit protection using a
  disposable loopback remote. `native-performance-after.log` records evidence.
- All nine scorable files in `performance-manifest.txt` finish at CodeScene 10,
  with zero findings from every relevant local analyzer. Navigation improves
  from two findings to zero; all other zero baselines remain zero.
- Localization: no UI copy changes. PostHog: no event needed for optimizing
  existing actions; no document content or identifiers leave the device.

### Git controls and installation settings

- The footer exposes Settings, Sync and Commit. Manual mode is the default:
  Sync refuses uncommitted changes before network activity; Commit accepts the
  user's message without contacting a remote; Commit and sync combines them.
- AutoGit is opt-in, coalesces edits after thirty foreground idle seconds, and
  checks the remote every two active minutes. Blocking dialogs/operations and
  divergent history pause automation. This is not background-sync support.
- Settings publish only after a validated atomic write succeeds. Regression
  tests cover duplicate startup loads, failed persistence, interrupted rename,
  corrupt current files with a valid backup, and unrecoverable settings.
- Confirmed no-document-change Git results resume the existing editor without
  resetting selection or re-indexing. Unknown failures still refresh safely.
- Native QA caught a 33-point commit-message field; the new Git controls now
  allocate 44-point touch surfaces. The native switch measures 44 by 26 points,
  and its preference survives process termination/relaunch. A native cold-start
  sync also exposed a WebView readiness race: document reads now wait for the
  bridge and fail closed on a bounded timeout, never substituting empty content.
- `TabletGitSettingsTests` passes the settings test and, after the readiness
  fix, the manual sync/commit test. The disposable app-owned repository contains
  `iPad manual commit QA` as a real commit with the original custom frontmatter;
  its working tree is clean. No original user vault or GitHub remote was changed.
- ADR 0212 documents settings storage, foreground automation, explicit manual
  commits, confirmed no-change editor resumption, and the RNR Switch dependency.
- Localization: thirteen keys translated by Lara into all configured targets;
  the additional Belarusian Latin catalog is maintained explicitly. All 21
  catalogs validate against 1,217 English keys. Analytics consent/event wiring
  remains pending before release, so this batch alone is not releasable.
- Final scoped suite: 1,352 tests pass. All 32 scorable touched/new files have
  CodeScene 10 and no findings; declarative files have no scorable code and no
  warnings. Staged CLI delta checks 32 files with no issues. Individual local
  scans report zero findings at every severity, with all five TS, three Swift
  or four JSON analyzers successfully processing their exact target. Existing
  zero baselines remain zero. The exact manifest is `git-settings-manifest.txt`;
  per-file records end in `-git-after.json` and `-git-after-cs.json`.

### Desktop-derived appearance

- Desktop CSS now generates the mobile Light and Dark palettes through a
  development-only PostCSS parser. A drift test compares the generated tokens
  with the desktop source. NativeWind/RNR and explicit native styles consume
  the same resolved palette; System, Light and Dark preferences persist.
- Rich-editor theme changes inject only CSS, without resetting the document,
  cursor or frontmatter. Source syntax tokens are semantic rather than carrying
  baked-in light colors. Stored document mark colors remain unchanged.
- The Release iPad simulator passes native color/persistence and dark-surface
  tests. Measured RGB values: dark sidebar 25/24/20, dark editor 31/30/27, light
  sidebar 247/246/243, tolerance four per channel. The theme survives relaunch.
  Dark inspector, relationship picker, type-visibility picker and source editor
  are captured and inspected. Type rows remain 52 points high with aligned icons.
- Full-screen XCTest attachments are used for review: this simulator's
  application-only screenshot API crops landscape captures incorrectly. The
  Mac became locked during QA, so direct computer-use interaction was unavailable;
  native XCTest continued, without substituting browser checks.
- Scoped tests: 1,365 passing before the separate analytics batch. Mobile lint
  and typecheck pass. ADR 0213 records the palette boundary; ABSTRACTIONS is
  updated. No localization keys changed. Appearance usage instrumentation is
  intentionally grouped with the pending opt-in privacy implementation.
- Per-file evidence is in `theme-final-manifest.txt`, `-theme-final.json` and
  `-theme-final-cs.json`; late corrections use `-theme-recheck` records. The
  compact toolbar's two baseline warnings and overflow action duplication were
  corrected. Final scan completion and the staged delta are recorded at commit.
- Final theme gate: 88 exact code/config targets, 436 successful per-file
  analyzer rows, zero findings at every severity and no analyzer errors.
  Existing zero baselines remain zero; the compact toolbar's two warnings and
  the workspace action import's one Info are removed. All scorable files finish
  at CodeScene 10; declarative files have no score and no findings. Staged delta
  checks 86 eligible files with no issues. The later combined scoped run has
  1,373 passing tests, including eight uncommitted analytics tests. Demo-vault
  directories are clean. Cloud parity/exact-SHA verification remains unavailable
  under the recorded exception, not a passing release gate.
- A separate live GitHub device-code check passes in the Release iPad app:
  requesting authorization displays the code; Copy reports success without
  leaving Tolaria; Cancel closes authorization. No login was completed and no
  repository was contacted. The initial fixture-source attempt lacked vault
  management; the passing check uses the disposable app-local vault instead.

### Consent-bound usage events

- Settings exposes the existing localized usage-analytics switch, off by default.
  With consent and an explicitly configured public PostHog project key, typed
  events record note swipe actions, successful appearance/AutoGit preference
  changes and Git operation requests. No document text, paths, note identifiers,
  repository names, commit messages, credentials or raw errors are accepted.
- Events are `mobile_note_swipe_used`, `mobile_setting_changed` and
  `mobile_git_operation_requested`. The latter measures attempts, not claimed
  sync success. Identifiers are ephemeral per consented session; person profiles
  and GeoIP are disabled. Opt-out immediately aborts pending requests, with no
  disk queue or retry loop. Unconfigured builds perform no analytics requests.
- Eight focused tests protect consent, explicit metadata projection, bounded
  requests, timeout, opt-out cancellation, endpoint validation and transport
  failures. The combined settings/analytics suite has seventeen passing tests.
  Native privacy QA failed before the control existed and passes after rebuilding:
  default off, opt-in, terminate/relaunch, persisted on, revoke. QA has no project
  key, so exercising the switch does not transmit events.
- ADR 0214 and ABSTRACTIONS document this boundary. Localization: no new UI copy;
  existing translated labels are reused. Existing code baselines are the prior
  theme final records plus `analytics-vault-baseline` for `useMobileVaults.ts`.
  The exact batch manifest is `analytics-manifest.txt`; per-file final evidence
  ends in `-analytics-after`. All fourteen files score CodeScene 10 with no
  findings, and the staged delta is clean. All sixty-six expected per-file local
  analyzer runs complete with zero findings at every severity and no errors.
- Keyboard QA remains explicitly incomplete: the source Up test did not move
  the caret. A control test also failed to move Left in an ordinary folder-name
  input (`ABCD!` instead of `ABC!D`). These experiments are retained in external
  QA evidence, not counted as passing regressions or as proof of an editor bug.
  Manual hardware-keyboard confirmation is still required when computer-use
  access is available. The previously verified rich-editor Up result stands.

### Explicit interface density

- Standard retains desktop metrics; Larger derives 110% typography, line heights,
  spacing and control sizes. Pane widths, maximum document width, strokes, radii,
  colors and weights remain unchanged. Immutable metric sets flow through the
  existing appearance context and memoized style factories; editor CSS updates
  independently of document state. Larger is the persisted default.
- Native `TabletDensityTests` fails before the control exists, then passes with
  actual sidebar row/content/label measurements, horizontal and vertical insets,
  count-pill height and centering, unchanged panel width, relaunch persistence,
  and portrait rotation. Padding tolerance is 0.6 points; only native text line
  boxes allow one point for pixel rounding (a 19.8-point line measures 20-20.5).
  Standard sidebar insets measure 12/6 points; Larger measures 13/6.5 versus the
  13.2/6.6 token targets. Count pills measure exactly 20 and 22 points.
- Five software-keyboard checks also pass: long and short forms in both
  orientations, rotation, dismissing the background editor keyboard when opening
  a form, and the shared tablet formatting strip remaining visible and tappable.
  `density-keyboard-native.xcresult` contains all six passing tests.
- Seven additional native checks pass in `density-surfaces-native.xcresult`:
  dark-mode panels/editor/inspector/dialogs and persistence, both note swipe
  workflows, shared formatting, relationship addition and type visibility.
- Full-screen landscape and portrait captures were inspected. The sidebar rows
  retain padding, note selection fills the row, muted previews remain distinct,
  and editor content fits without overlapping chrome. Canonical 100% layout
  contracts should be run at Standard density; ADR 0215 records this adaptation.
- Hardware-arrow experiments remain inconclusive: typing through the app
  rather than refocusing a field still fails the ordinary-text-field control
  test. These experiments are archived externally, not committed as passing
  tests. The Mac remains locked, so manual hardware verification is unavailable.
- Scoped suite: 1,378 tests pass; mobile lint/typecheck and localization validation
  pass. No new localization keys or translations are needed. Successful scale
  changes emit the consent-bound `mobile_setting_changed` event (`uiScale`).
- Baselines: `metrics-baselines.json` and `metrics-extra-baselines.json` reuse
  exact unchanged final file reviews from the preceding verified commits.
  Final per-file records use `-metrics-final`; `metrics-analyzer-evidence.json`
  includes content hashes so late edits must be re-scanned before commit.
- All 63 code files finish at CodeScene 10 with no warnings; the staged delta
  checks all 63 and reports no issues. All 311 expected per-file local analyzer
  runs complete successfully with zero findings at every severity and no errors.
  Final hashes match the scanned contents, including re-scans of late test and
  command-palette edits. Exact paths/classification are recorded in
  `metrics-final-manifest.json`; demo-vault directories remain clean.
  Cloud verification remains unavailable under the recorded exception.
