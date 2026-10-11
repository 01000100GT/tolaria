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
| 1 | One-tap copy of GitHub device authorization code | Pending |
| 2 | Searchable, aligned, scrollable repository picker for large lists | Pending |
| 3 | Panel backgrounds/dividers extend through top safe area; footer through bottom safe area | Implemented; native screenshot verified |
| 4 | Editor-focused arrow keys never change selected note | In progress |
| 5 | Restore desktop-style editor slash commands | Pending |
| 6 | Inline find in note, with visible match navigation/highlighting | Pending |
| 7 | Desktop-compatible type discovery, plural labels and custom sidebar names | Implemented; model tests and native type navigation pass |
| 8 | Saved views apply their actual persisted filters | Implemented; parser and native filtered navigation pass |
| 9 | Discoverable property addition, aligned backlinks, adding values to existing relationships | Pending |
| 10 | Breadcrumbs use the note's configured type icon and color | Implemented; native typed icon verified |
| 11 | Favorite and other local actions respond without avoidable delay | Bounded flag edits and lazy settings suggestions implemented; native model timings recorded |
| 12 | Rich-editor formatting commands match source-editor capabilities | Implemented shared tablet strip; native formatting test passes |
| 13 | Right-aligned breadcrumb actions and a reduced overflow menu | Pending |
| 14 | Tablet UI approximately ten percent larger while retaining hierarchy | Pending |
| 15 | Explain and verify local Git and remote sync behavior | Code inspected; native remote QA pending |
| 16 | Type-visibility picker has properly aligned native option rows | Implemented; native measured regression passes |
| 17 | Visible sync controls/status, automatic Git and manual commits with user messages | Pending |
| 18 | Essential settings chosen from an audit of desktop settings | Pending |
| 19 | Note-row swipes: favorite on left, delete/archive on right; full swipe favorites or archives, never deletes | Implemented; two native tablet tests pass; phone QA pending |
| 20 | Desktop-matched dark mode throughout native chrome, dialogs and editor | Pending |

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
