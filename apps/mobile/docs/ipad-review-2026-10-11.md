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
| 3 | Panel backgrounds/dividers extend through top safe area; footer through bottom safe area | Pending |
| 4 | Editor-focused arrow keys never change selected note | In progress |
| 5 | Restore desktop-style editor slash commands | Pending |
| 6 | Inline find in note, with visible match navigation/highlighting | Pending |
| 7 | Desktop-compatible type discovery, plural labels and custom sidebar names | Cap/pluralization fixed; native verification pending |
| 8 | Saved views apply their actual persisted filters | Parser fixed; native verification pending |
| 9 | Discoverable property addition, aligned backlinks, adding values to existing relationships | Pending |
| 10 | Breadcrumbs use the note's configured type icon and color | Pending |
| 11 | Favorite and other local actions respond without avoidable delay | Pending |
| 12 | Rich-editor formatting commands match source-editor capabilities | Pending |
| 13 | Right-aligned breadcrumb actions and a reduced overflow menu | Pending |
| 14 | Tablet UI approximately ten percent larger while retaining hierarchy | Pending |
| 15 | Explain and verify local Git and remote sync behavior | Code inspected; native remote QA pending |
| 16 | Type-visibility picker has properly aligned native option rows | Pending |
| 17 | Visible sync controls/status, automatic Git and manual commits with user messages | Pending |
| 18 | Essential settings chosen from an audit of desktop settings | Pending |
| 19 | Note-row swipes: favorite on left, delete/archive on right; full swipe favorites or archives, never deletes | Pending |
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
