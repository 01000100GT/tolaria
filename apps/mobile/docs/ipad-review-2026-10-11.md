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

### Generated editor bundle analyzer exception

- Approver: Luca explicitly approved the generated-bundle analyzer exception
  in this chat on 2026-10-11; recorded at 20:21 UTC. Expires 2026-10-14 20:21 UTC
  or when the analyzer can process the bundle, whichever comes first. Review
  and remove within seven days. This does not authorize production promotion.
- Affected file: `apps/mobile/src/components/workspace/MobileWysiwygTentapEditorHtml.ts`.
  The local Codacy CLI rejected this approximately 1.2 MB generated artifact
  at its hard 150 KB limit on the initial run and retry. Evidence is retained
  as `MobileWysiwygTentapEditorHtml.ts-before.json` and
  `generated-html-retry.json` in the Jupiter review evidence directory.
- Blocked command: the recorded individual `codacy-analysis analyze` invocation
  for that exact path using the existing mobile analyzer configuration.
  A skipped generated artifact is not a clean scan or a zero-finding result.
- Risk: the artifact embeds application code and bundled dependencies which the
  local generated-file scan cannot examine as a whole. No scanner limits,
  suppressions, quality floors, authentication, or release gates are changed.
- Compensation: individually scan all editable sources touched by these editor
  changes, review their CodeScene before/after results, rebuild the artifact with
  the committed generator, run focused behavior tests and the scoped mobile
  gates, and verify slash/find interaction, document preservation and native
  rendering in the iPad simulator. No hand edits to the generated bundle.

## Checklist

| # | Requested result | Status |
| --- | --- | --- |
| 1 | One-tap copy of GitHub device authorization code | Implemented; native live device-code copy/cancel check passes |
| 2 | Searchable, aligned, scrollable repository picker for large lists | Implemented; authenticated native search/row geometry verified; full Laputa clone exceeded the ten-minute acceptance limit |
| 3 | Panel backgrounds/dividers extend through top safe area; footer through bottom safe area | Implemented; native screenshot verified |
| 4 | Editor-focused arrow keys never change selected note | Implemented; native rich-text and source hardware-arrow checks pass; source edits/frontmatter survive cold launch |
| 5 | Restore desktop-style editor slash commands | Implemented; 15 supported commands, actual TenTap runtime tests and native touch-to-Markdown test pass |
| 6 | Inline find in note, with visible match navigation/highlighting | Rich-text native navigation/replacement/44-point layout pass; source highlighting implemented, long-document scroll fix awaiting native recheck |
| 7 | Desktop-compatible type discovery, plural labels and custom sidebar names | Implemented; model tests and native type navigation pass |
| 8 | Saved views apply their actual persisted filters | Implemented; parser and native filtered navigation pass |
| 9 | Discoverable property addition, aligned backlinks, adding values to existing relationships | Implemented; native relationship-add, inspector, on-disk backlink geometry and navigation pass |
| 10 | Breadcrumbs use the note's configured type icon and color | Implemented; native typed icon verified |
| 11 | Favorite and other local actions respond without avoidable delay | Bounded flag edits and lazy settings suggestions implemented; native model timings recorded |
| 12 | Rich-editor formatting commands match source-editor capabilities | Implemented shared tablet strip; native formatting test passes |
| 13 | Right-aligned breadcrumb actions and a reduced overflow menu | Implemented Note/Edit/File groups and direct tablet outline action; native menu/Undo geometry checks pass |
| 14 | Tablet UI approximately ten percent larger while retaining hierarchy | Implemented; native Standard/Larger numeric geometry, persistence and rotation pass |
| 15 | Explain and verify local Git and remote sync behavior | Native disposable-remote probe passes; explicit manual commit verified on disk |
| 16 | Type-visibility picker has properly aligned native option rows | Implemented; native measured regression passes |
| 17 | Visible sync controls/status, automatic Git and manual commits with user messages | Implemented; native manual commit/settings persistence pass; automatic remote UI QA pending |
| 18 | Essential settings chosen from an audit of desktop settings | Git, appearance, UI density and opt-in privacy settings implemented; native persistence checks pass |
| 19 | Note-row swipes: favorite on left, delete/archive on right; full swipe favorites or archives, never deletes | Implemented; two native tablet and two native phone tests pass |
| 20 | Desktop-matched dark mode throughout native chrome, dialogs and editor | Implemented; native pixel, persistence, inspector/dialog and source-editor checks pass |

Sidebar type-selection latency belongs to item 11. The earlier bottom-safe-area
clarification belongs to item 3. Panel drags must not consume item 19's row
gestures. Preserve explicit panel toggles. Git currently checkpoints local edits,
fetches, fast-forwards or pushes without force, and stops on divergence. This
existing implementation is not proof of working user-facing iPad sync.

## Batch evidence

Record exact files, baseline/final analyzer results, regression tests, native
measurements, commits and remaining limitations as each batch completes.

### October 12 follow-up acceptance

- Restore editor-interior left/right panel drags without consuming note-row
  quick actions, vertical content scrolling, or formatting-toolbar scrolling.
- Collapse the duplicated phone editor headers into one navigation/action bar.
- Profile type selection and note opening against the large Laputa vault on
  the native runtime, then address measured bottlenecks.
- Expose GitHub account controls and remembered vault switching/add/remove in
  Settings. Forgetting a vault must never delete its files.
- Complete the remaining native source Find, authenticated repository picker,
  real clone/read-only sync, and disposable-remote automatic sync checks.
- Preserve Laputa content. Use fixture-backed screens or disposable repositories
  for all mutation tests; do not commit or push test content to Laputa.
- Starting CodeScene: Hotspot 10, Average 9.9912958288353, above 10 / 9.99 floors.
  The existing owner-approved analyzer exceptions remain in force until their
  recorded October 14 expiry, not indefinitely.

### Slash commands and inline Find/Replace

- Rich-text slash commands use the production TenTap schema and keyboard
  handling, plus a native searchable command list. Fifteen supported actions
  include paragraphs, headings, lists, quote, code, divider, table and math.
  URLs, code blocks and nonempty selections do not open the menu. Unsupported
  desktop block types are not presented as working native commands.
- Find opens below the breadcrumbs, not in a modal. The rich editor highlights
  all matches, distinguishes the active match, scrolls it into view and supports
  previous/next, case-sensitive and safe-regex searches, replacement and undo.
  Source Find reuses the same controls and preserves raw YAML frontmatter.
- The actual TenTap test harness covers all 15 slash actions, arrow/Enter/Escape
  selection, stale choices, undo, formatted-text matches, regex safeguards and
  replacement capture groups. Two source-layer tests preserve syntax tokens and
  frontmatter while highlighting the active match.
- Native `TabletEditorFindSlashTests` initially caught 26.5-point Find buttons.
  Explicit 44-point RNR controls fix this; both tests pass in the Release iPad
  simulator. Touching Heading 2 produces `## Slash heading` in raw Markdown.
  Native screenshots verify yellow match highlights and a distinct active match.
- A manual 65-paragraph source test caught the last match remaining offscreen.
  The fix uses React Native's public `setSelection`, which invokes native
  selection scrolling, rather than `setNativeProps`. The rebuilt app is installed;
  the Mac locked before its final native recheck. This check remains pending.
- The first scoped suite run passed 1,403 tests and failed the parity-inventory
  completeness check for the new components. The inventory must be updated with
  their desktop references before committing. Those entries are now present;
  the rerun passes all 1,409 tests, including the following Git regression batch.
- PostHog: opt-in `mobile_editor_tool_opened` records only `find`, `replace` or
  `slash`. Queries, replacements and document content are never event properties.
- Localization: existing translated labels reused; no UI copy changes.
  Architecture documents the existing editor bridge boundary; no new dependency
  or storage strategy. Generated HTML remains under the explicit exception.
- Final editor manifest: `editor-scan-manifest.json` in the evidence directory,
  with all branch changes, untracked paths and the exact 30-path commit batch.
  All 28 code paths have CodeScene review: scorable files score 10, while the
  generated bundle, configuration and declarative inventory are unscorable with
  no findings. Existing 10 baselines remain 10. Slash dispatch, menu visibility
  and source Find helpers were simplified to meet the gate without suppression.
- All 27 analyzable code paths have individual successful local Codacy scans:
  133 analyzer rows, zero Critical/High/Medium/Minor/Info/unclassified findings
  and no tool errors. Each TypeScript file has Biome, ESLint9, Opengrep, Trivy
  and Lizard; Swift has Opengrep, Trivy and Lizard. WebView source improves from
  one unused-import finding to zero; all other existing zero baselines remain
  zero. Generated HTML is explicitly excluded under the approved exception,
  never counted as zero. Cloud analyzer parity/exact-SHA verification remain
  unavailable under the separately recorded owner approval.
- CodeScene staged CLI delta: no issues across 28 checked files. Project
  Hotspot 10, Average 9.991289158049293, above the 10 / 9.99 floors. MCP safeguard
  is unavailable, not claimed as passing. No direct-to-main promotion is made.
- Mobile lint/typecheck pass; locale validation passes all 21 catalogs. No full
  desktop/Rust suite or release coverage measurement was run in this scoped
  experimental batch. Demo vault dirt is empty. Native recheck and authenticated
  Git QA remain explicit open items while the Mac is locked.

### Authenticated Laputa clone investigation

- Luca authorized additive-only local QA changes, with exact cleanup afterward.
  No existing user note may be modified, and no QA note may be pushed to Laputa.
  GitHub login remains intact. Editor checks above use disposable fixture data.
- Native CFNetwork logs show the user's clone request received HTTP 200 and
  214,529,014 bytes, then was cancelled at 120,017 ms. The transport's fixed
  120-second deadline aborted a progressing large download. The transport now
  applies that deadline to network waits, pausing it during consumer processing
  and resetting it for each read. Explicit cancellation and redirect rejection
  remain intact, and early termination cancels the unfinished response stream.
- Red: progressing-download and slow-consumer tests fail with the original
  deadline. Green: all seven streaming/transport tests pass, including stalled
  bodies, stalled response headers, early cancellation and binary request bytes.
  No new UI copy, dependency, Git history policy or remote mutation is introduced.
  PostHog: no new event needed for repairing an existing clone operation.
- Release simulator build succeeds with the fix. Live large authenticated clone
  and automatic remote UI checks remain pending because the Mac is locked.
  No real Laputa note was changed or added during this batch, so there is no
  user-vault QA content to remove. Do not interpret the transport regression
  tests as proof that the full large-vault clone has completed.
- Final manifest: `git-stream-scan-manifest.json`, containing the exact four
  changed paths plus branch-wide tracked/untracked manifests. Existing
  `gitFetchClient.ts` remains CodeScene 10 and local Codacy zero; new
  `gitFetchStreaming.test.ts` scores 10 with zero findings. Both files have five
  successful, one-file analyzer rows: Biome, ESLint9, Opengrep, Trivy and Lizard,
  with zero findings at every severity and no errors. Staged CLI CodeScene delta
  passes both files. No suppressions or analyzer-limit changes were introduced.
- The scoped 1,409-test mobile suite includes these regressions. Release iPad
  build is installed and launched with `source=native-vault`, preserving the
  authenticated app data rather than leaving the fixture screen as the default.
  Exact QA markers are absent from app Documents. No `~/Laputa` file was changed.
  Cloud verification remains unavailable under the recorded exception; native
  clone, source scrolling and automatic-sync UI QA are not marked complete.

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

### Source scrolling and native gesture regression coverage

- Native reproduction caught two independent source-editor defects: the syntax
  layer stayed stationary while the input scrolled, and a viewport-sized absolute
  layer clipped later lines. A shared Reanimated scroll value now follows native
  input events on the UI thread; the syntax document has its natural full height.
  Web preview uses the textarea's actual scroll position. The RNR input remains
  the editing control, with no document or frontmatter serialization changes.
- The existing keyboard-avoiding host now contains both source modes; obsolete
  minimum heights no longer force formatting controls beneath the keyboard.
  Failing native checks preceded both repairs. The strengthened regression checks
  the full syntax height after typing fifty lines, not only its scroll offset.
- Final Release build: `source-and-panels-final.xcresult` passes all three tests:
  continuous panel transitions, source scrolling and source formatting through
  keyboard rotation. Full-screen screenshots show later lines and caret aligned,
  with formatting above the keyboard. Header/edge panel drags are tested
  separately from the approved note-row quick actions.
- `phone-swipe-final.xcresult` passes both native iPhone tests: partial and full
  favorite swipes, Delete/Archive reveal, and full-swipe archive without deletion.
  The native runner supports both tablet and phone destinations.
- All three browser viewport scroll checks pass in `source-scroll-web-verified.log`.
  Mobile lint passes and twelve targeted source/draft/frontmatter tests pass.
  No full desktop or Rust suite was run. Normal mobile hooks run before push.
- Seven exact code paths are recorded in `source-scroll-final-manifest.json`.
  Every scorable file remains or starts at CodeScene 10 with no findings; the
  Ruby project generator remains unscorable with no findings. Baselines are
  `source-scroll-baselines.json`, `native-project-before`, and
  `panel-gesture-before`. All 27 expected per-file local analyzer runs complete
  with zero findings at every severity and no errors; hashes are retained in
  `source-scroll-analyzer-evidence.json`. Cloud verification remains unavailable.
- Localization: no UI copy changes. PostHog: no event needed because this repairs
  existing scrolling/keyboard behavior and expands regression coverage.
  ABSTRACTIONS and native QA documentation are updated; no ADR is needed.
  Manual source hardware-arrow verification remains outstanding while the Mac
  is locked; software-keyboard success is not substituted for that check.

### Grouped note actions

- More actions now opens Note, Edit and File categories rather than one long
  mixed list. Categories and note summary remain fixed while commands scroll.
  Non-Markdown entries expose only applicable groups. Tablet breadcrumbs expose
  the existing outline command directly; phones retain the smaller toolbar.
- Native measurement caught an 18.5-point menu row despite its declared padding.
  Reusing the existing RNR Button with explicit native layout fixes the actual
  row. Group buttons and command rows measure at least 44 points. Flattened
  wrapper styles also preserve these dimensions in React Native Web; tab roles
  and selected state are exposed correctly to accessibility.
- `overflow-ipad-final-persist.xcresult` passes the grouped menu, direct outline,
  favorite Undo and on-disk unopened-note delete/Undo/relaunch checks. The
  restored file retains its complete body and custom frontmatter. The disposable
  fixture is in the app sandbox, never the user's Laputa vault.
- `overflow-phone-actions.xcresult` passes the grouped menu and favorite Undo on
  iPhone. Screenshots were inspected alongside measured geometry. A separate
  phone-create regression was discovered: new notes select in the list without
  opening the editor; it remains the next fix, not a passing workflow.
- The affected browser lane initially passed 41 checks. Four failures were
  corrected in focused reruns: desktop contexts now use mouse long-press, and
  the favorite assertion identifies the breadcrumb control rather than matching
  hidden swipe actions. The 20-check rerun passes; after extracting a safe
  content assertion, all 17 applicable workspace interaction checks pass again.
- All 28 code paths and classifications are in `overflow-final-manifest.json`.
  Every scorable file starts/remains at CodeScene 10; the type-only file remains
  unscorable with no findings. Staged delta checks all 28 with no issues. All 136
  expected local analyzer runs complete with zero findings/errors and matching
  file hashes. The existing dynamic-regex finding in the interaction test is
  removed, from one Critical to zero. Cloud verification remains unavailable.
- Mobile lint and typecheck pass. Existing translated labels are reused, so no
  UI copy changed. PostHog: no event needed for reorganizing existing commands.
  Native QA and ABSTRACTIONS documentation are updated; no ADR is needed.
  Demo-vault directories remain clean. The simulator's disposable Spotlight
  index was retained on Jupiter to recover local disk space without deleting
  app documents or user vault data.

### Phone creation and on-disk backlink verification

- Native testing exposed a phone-only navigation omission: new notes were
  created and selected, but the list stayed on screen. The phone shell now wraps
  the shared create action with its editor transition. Plus, Cmd+N and command
  palette reuse that path. No-vault/read-only flows still open the vault picker;
  document creation and persistence remain in the shared controller.
- Red: both browser plus/shortcut flows and the native create test failed to
  reach the editor. Green: three browser entry points pass, with no title dialog
  and a body-only document retaining its type frontmatter. Three existing phone
  note/editor action checks also pass. Final Release simulator result
  `phone-create-and-swipes-final.xcresult` passes note creation/typing/reopening
  and both row-swipe regressions.
- `native-backlink.xcresult` passes against real files in an isolated app-owned
  vault. The backlink row is over 200 points wide and at least 28 points high;
  its icon is vertically centered within one point and inset at least six
  points. Following it opens the referring file and its full body. The screenshot
  confirms horizontal icon/text layout. This is not an authenticated GitHub test.
- Existing `PhoneWorkspace.tsx`: CodeScene 10 -> 10, local findings 0 -> 0.
  Both new Swift files score 10 with no findings. The parameterized browser spec
  is unscorable with no findings. All 16 expected per-file analyzer runs complete
  with zero findings/errors; hashes match `phone-create-analyzer-evidence.json`.
  Exact paths/classification are in `phone-create-final-manifest.json`. Staged
  delta checks all four code files with no issues. Mobile lint/typecheck pass.
- Localization: no UI copy changes. PostHog: no event needed for repairing
  navigation of an existing create action. No new component, dependency or ADR;
  native QA and ABSTRACTIONS documentation are updated. Demo-vault dirt is empty.
- Simulator cleanup: the disposable Git vault, catalog and test settings are
  retained under `retained-disposable-git-ui-fixture` in the evidence directory.
  The original simulator configuration matches its pre-test backup exactly.
  No user vault files were modified. Builds and scanner temporary files remain
  on Jupiter; approximately four GiB of local disk space is available.

### Source hardware keyboard acceptance follow-up

- With the Mac unlocked, computer-use input verified Up and Down in the native
  source editor, first with the in-memory fixture and then with an isolated
  on-disk Git vault. Simulator must actually be foreground for hardware input;
  accessibility focus alone did not deliver keys. The initial no-op attempts
  were not counted as passing checks.
- Up moved from the third test line to the second: typing `x` changed only the
  second line to `Second source linxe`. Down returned to the third line:
  typing `z` produced `Third source linez`. The selected note remained Native
  Git review while both notes were visible in All Notes.
- Reading `review.md` from the simulator's app-owned filesystem confirmed the
  exact edits and unchanged `type: Essay`, `status: Draft`, and
  `custom: preserved` frontmatter. Terminating and relaunching Tolaria retained
  the same document and properties. Screenshot evidence:
  `source-hardware-arrows-on-disk.png` in the existing Jupiter evidence folder.
- The temporary Git vault/catalog are retained outside the simulator after QA;
  the original vault configuration is restored. No remote was contacted and no
  user vault was edited. Keyboard capture is restored to its initial off state.
- This follow-up changes documentation only. No new UI copy, analytics event,
  dependency or ADR; no code-file analyzer manifest entries or coverage changes.
  Project CodeScene still reports Hotspot 10.0 / Average 9.991289158049293.
  Codacy cloud roster lookup still fails with missing authentication after retry;
  the existing exception remains applicable, not a passing cloud verification.

## Remaining acceptance blockers

- Rich-text slash commands and inline Find/Replace pass native checks. The
  generated-bundle exception is approved above. Long-source Find also passes
  independently on an isolated on-disk note, including scroll and frontmatter
  preservation; neither result implies large-vault Git acceptance.
- Authenticated repository search and row geometry work with the existing
  GitHub session. A real Laputa clone did not complete within ten minutes; the
  partial QA clone was stopped, without changing the existing vault or remote.
  Large-repository clone progress/performance and subsequent no-change sync are
  not accepted yet. Foreground AutoGit remote UI acceptance is also pending;
  the native disposable-remote transport probe is not its substitute.
- Cloud Codacy parity/exact-SHA verification and CodeScene MCP remain unavailable
  under the owner-approved exception above. This is an implementation handoff on
  the mobile branch, not a production release or a claim that all twenty items
  have passed final acceptance.

## October 12 navigation follow-up evidence

- Restored editor-interior horizontal panel navigation while preserving note-row
  quick actions and formatting-strip scrolling. The focused intent regression
  failed first; the native editor drag regression also failed on the previous
  binary, then passed on the rebuilt Release app.
- Phone editor navigation and editor actions now share one toolbar. Native tests
  verify a single title, all six actions inside that toolbar, source/properties
  navigation and returning to the list. Computer-use inspection confirms the
  duplicate toolbar is gone; the title truncates without overlapping actions.
- Tablet footer no longer reserves a second bottom safe-area row. Native frame
  assertions pass in portrait and landscape: height at most 34pt, bottom edge
  flush with the app, central home-indicator lane free of buttons.
- Native acceptance: editor swipes, row actions, formatting scrolling, rich find,
  slash commands and existing panel gestures pass. Phone header and row-action
  tests pass (3 tests); tablet footer passes after correcting a test that sampled
  frames before rotation completed. This supersedes the old slash/find blocker
  above; long-source find acceptance is still pending.
- Mobile lint/typecheck and 1,410 tests across 241 files pass. No desktop/Rust
  suite or release coverage run: this is scoped experimental mobile work.
- CodeScene: all nine scorable touched/new code files are 10.0; toolbar prop
  types have no scorable code/findings. Existing files started at 10.0 or null.
  Local Codacy: every code path has zero findings/errors; each TypeScript file
  completed Biome, ESLint9, Semgrep, Trivy and Lizard; Swift completed Semgrep,
  Trivy and Lizard. Cloud/MCP limitations retain the time-bounded exception.
- Evidence directory: `/Volumes/Jupiter/Cache/tolaria-mobile-followup-20261012`.
  Contains individual scan manifests/results, native result bundles, build logs
  and pre-test SHA-256 manifests for both local and simulator Laputa contents.
- Localization: no UI copy changes in this batch. PostHog: no event needed for
  layout repairs or restored existing navigation. No dependency, ADR or model
  change; abstractions documentation updated. No user-vault edits.
- Remaining requested work is explicitly retained: phone notch background and
  shorter footer/copy; GitHub settings; remembered local/Git vault add/switch/
  forget; measured section/note responsiveness; authenticated clone/no-change
  sync, isolated automatic-sync UI and long-source find native acceptance.

## October 12 account, vault, chrome and performance batch

- All eight follow-up requests remain tracked: editor panel swipes, one phone
  header and compact tablet footer shipped in the previous commit; this batch
  adds panel-aware phone insets, a shorter phone footer/copy, Settings GitHub
  controls, a persistent local/Git vault catalog, and bounded note hydration.
- Local imports now have independent directories. Existing imports migrate in
  place; switching uses the editor save barrier and forgetting only removes
  catalog metadata. `catalog-green.xcresult` verifies switching, relaunch and
  forgetting. Both disposable note files survived unchanged. The test catalog
  was removed and the original local Laputa registration restored afterward.
- Settings reuses the existing secure GitHub account controller. Native account
  controls and Settings-to-vault-manager navigation pass in
  `settings-green.xcresult`. No token storage or authorization protocol changes.
- `phone-final-verification.xcresult` passes single-header navigation, compact
  footer geometry and all four phone states. The phone footer is at most 55pt
  including its reduced bottom inset. Screenshot pixel samples are exactly
  RGB 255/255/255 above list/editor/properties and 247/246/243 above the sidebar;
  footer pixels retain 247/246/243. Copy is "2m ago" and "Open", with full
  accessibility labels retained. Tablet footer checks remain at most 34pt.
- A 1,000-note regression first observed 1,001 frontmatter parses when opening
  one note. Hydration now parses only the target and preserves other identities,
  timestamps and zero-write semantics. The Release/Hermes read-only benchmark
  on 6,036 notes measured 33ms hydration, 15ms type selection, 27ms favorite
  calculation, 602ms native indexing and 967ms snapshot construction. These
  are data-path measurements, not end-to-end screen-transition promises.
- The two-note native smart-HTTP integration passes clone/push/pull, binary and
  deletion preservation, save/checkout recovery, and a 16ms maximum timer delay.
  The real approximately 467MiB GitHub repository exceeded the native clone
  acceptance timeout. A separate read-only host shallow clone completed; that
  is diagnostic evidence only and does not establish native clone readiness.
- Browser checks passed eleven applicable navigation/screenshot/large-vault
  flows and found a stale unscaled reference setup. The reference tests now
  explicitly use Standard size, without relaxing tolerances. They also exposed
  RNR web icon sizing overriding desktop tokens; flattening the existing icon
  wrapper's styles fixes it. Both complete numeric parity checks then pass.
- Local scans cover 29 exact code paths and 133 successful analyzer/file rows,
  with zero findings at every severity and no tool errors. Managed Git storage
  improves from two findings to zero by using Expo's existing UUID generator;
  the browser spec's parser warning is removed by reusing its imported type.
  All scorable files score CodeScene 10, preserving existing 10 baselines.
  The exact manifest and individual results are in `followup-final-manifest.json`
  under the October 12 Jupiter evidence directory. Cloud/MCP limitations remain
  explicitly covered by the existing time-bounded exception, not reported clean.
- Localization: the two short phone labels are in the shared English catalog;
  Lara translation ran and validation passes all 21 catalogs / 1,219 keys.
  PostHog: `mobile_vault_catalog_used` carries only action and local/Git kind;
  layout fixes and hydration optimization do not add noisy events.
- ADR 0216 documents the local-vault catalog/storage change. ARCHITECTURE and
  ABSTRACTIONS describe the account/catalog and hydration boundaries. No new
  dependency. Only scoped mobile checks run, not desktop/Rust release coverage.
- SHA-256 comparisons show all 7,155 host Laputa files and 6,036 existing
  simulator Laputa files unchanged, with no added files. Demo-vault dirt is empty.
  Direct computer-use QA is blocked by the locked Mac; automated native checks
  and screenshots remain available. This is not a full release acceptance claim.
- `source-find-final.xcresult` passes Find/Replace on a 65-paragraph disposable
  on-disk note. The source syntax layer scrolls more than 400pt to the final
  match, the inline Find field remains hittable, and replacement changes exactly
  the requested token with the complete frontmatter and other text unchanged.
  The native screenshot shows the highlighted match above the keyboard. The
  fixture and incomplete QA clone were moved out of the app; the original
  catalog was restored byte-for-byte. `laputa-integrity-final.json` records the
  post-cleanup SHA-256 comparison and restored catalog.
- The final Release binary is installed on both simulators. The phone header
  and safe-area tests pass again in `phone-shipped-build.xcresult`. The actual
  Files-provider import picker and real large-vault AutoGit UI are not claimed
  as newly verified by the catalog tests.
- `tablet-shipped-build.xcresult` passes editor-interior panel drags and footer
  geometry in both orientations on the final binary. CodeScene's staged delta
  checked all 29 eligible files in the 55-path batch with no issues. Current
  project Hotspot 10.0 / Average 9.9912958288353 remain above 10.0 / 9.99 floors.
  The unavailable MCP safeguard is not reported as passed; CLI delta is the
  recorded compensating check under the owner-approved exception.
- Commits `e3cde4dac` and `db7d1e934` passed normal mobile hooks and were pushed
  to `origin/mobile-ui-foundation`. Both hooks passed lint, typecheck and all
  1,423 tests / 244 files; pre-push also exported the web bundle. The CLI change
  set against the prior mobile remote checked 38 eligible paths with no issues.
  Post-push project health remains 10.0 / 9.9912958288353. Cloud Codacy exact-SHA
  verification remains unavailable under the recorded exception.
- A final test-only safeguard makes the authenticated clone and two prepared-
  vault tests explicit environment opt-ins, documented in the native test README.
  `integration-optin-default.xcresult` verifies that all three skip before app
  launch when not enabled. Those skips are harness-safety evidence, not new
  integration passes; the earlier source/catalog acceptance results stand.
