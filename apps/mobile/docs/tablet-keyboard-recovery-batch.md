# Tablet keyboard and recovery batch

## Temporary analyzer exception

- Owner approval: Luca, in this task on October 11, 2026: "you can continue with
  the previous exception". This renews the requested scoped keyboard/form and
  recovery-UI exception, including tablet panel sizing and their regression QA.
  It is not a release approval or an authorization to bypass working checks.
- Starts October 11 at 06:16 UTC; expires October 12 at 06:16 UTC (24 hours).
  Close at batch completion; review/remove within seven days, by October 18.
- Blocked command: `mcp__codescene__pre_commit_code_health_safeguard`; the
  CodeScene MCP tools remain absent. CLI file/delta and project API checks work.
- Blocked command: `codacy tools gh refactoringhq tolaria --output json`;
  retried October 11, both attempts report "No API token found". Dashboard
  baselines, enabled-analyzer parity, and exact-pushed-SHA results are unavailable.
- Local legacy Codacy wrapper failed its prior retry with incomplete TypeScript
  parsing. The modern local CLI runs the project ESLint configuration and the
  available security analyzers; it does not establish dashboard parity.
- Risk: the missing dashboard and MCP checks may reveal findings not caught by
  local checks. Do not describe unavailable results as zero or release-ready.
- Compensation: CodeScene CLI before/after file reviews and staged delta,
  project threshold checks, per-file modern Codacy analysis, project lint and
  types, targeted regression tests, and actual native simulator interaction with
  numerical keyboard/control bounds. Normal commit/push hooks remain enabled.
- Affected scope: workspace action sheets, native editor keyboard placement,
  tablet panel sizing, selected-note recovery UI, and their tests/docs. Record
  each batch's exact paths and results below before commit. No Android SDK
  license acceptance or new platform dependency is authorized by this exception.
- Starting project CodeScene: Hotspot 10.0, Average 9.991289158049293; floors
  10.0 / 9.99. The branch starts clean at `43c99da061a9dc9d40c645ddf391a69060dfee26`.

## Acceptance

- Long and short forms keep their fields scrollable and their actions reachable
  with the native software keyboard in portrait and landscape; dismissal restores
  the normal sheet geometry. Preserve existing desktop spacing and typography.
- Formatting controls remain above the software keyboard while editing.
- Button-driven panel changes respect the same readable editor width as resize.
- Subsequent recovery work must preserve drafts on read failure, expose retry,
  and never substitute an editable empty note for a failed read.

## Evidence

Artifacts are stored in `/Volumes/Jupiter/Cache/tolaria-mobile-keyboard-2026-10-11`.
Results will be appended per verified commit. Original user vaults are not test
targets; native QA uses fixtures or the existing isolated app-local Laputa copy.

### Keyboard batch, October 11

Implementation: nested keyboard avoidance measures its screen origin; long forms
shrink and scroll while their footer remains reachable. The native formatting
toolbar participates in the resized editor layout, with TenTap's duplicate
keyboard inset disabled. Workspace overlays release WYSIWYG focus through the
existing tablet/phone command registry. Search retains its intentional autofocus.
No dependency, storage format, or desktop design-token change was introduced.

Red evidence: `red-keyboard.xcresult` reproduces the hidden Create View footer;
`red-form-transition.xcresult` reproduces opening that form while the background
WKWebView owns the software keyboard. Both assertions fail before their fixes.
The command-registry regression tests also failed before blur forwarding existed.

Native QA: `keyboard-final.xcresult` passes eight tests in 161.6 seconds on the
standalone iPad Pro 13 / iOS 18.3 app. Five keyboard tests cover long forms in both
orientations, a short folder form, WYSIWYG formatting/heading selection, and
editor-to-form focus handoff. Existing panel-drag, formatting, and rotation tests
also pass. Tests require a keyboard taller than 200 points, button bounds above
its actual screen frame, reachable controls, 44-point formatting targets, and
the existing 640-point sheet / 16-point input inset. These are native assertions,
not browser screenshots or simulated JavaScript inset values.

The final registry refactor is rechecked separately in `keyboard-commit.xcresult`;
the native bundle is `keyboard-commit.js` compiled with Hermes `-O`. The app
executable comes from the previous verified native build; no native module changed.
Layout and persistence checks are recorded after this installation below.

#### Local analyzer manifest

All paths below are relative to `apps/mobile/`. E means existing at batch start;
N means newly added in this batch. The complete branch-against-main and untracked
inventories are `final-branch-manifest.txt` and `final-untracked-manifest.txt` in
the evidence directory; this scoped batch is not a rescan of all earlier branch
work or a final `origin/main` release/preflight.

Every final `0` below means successful per-file execution with **0 Critical,
0 High, 0 Medium, 0 Minor, 0 Info, and 0 unclassified findings**. B = Biome 2.5.6,
E9 = ESLint9 honoring project `eslint.config.js` (project 9.39.2; CLI bundled
identity 9.39.5), O = Opengrep 1.26.0, T = Trivy 0.72.0, L = Lizard 1.23.0.
A dash means the analyzer does not support Swift, not a successful Swift scan.

| File | Kind | Baseline | B | E9 | O | T | L | CodeScene |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/components/workspace/MobileWorkspaceActionSheet.tsx` | E | 2 Opengrep Error, others 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/components/workspace/MobileWysiwygMarkdownEditor.native.tsx` | E | All 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/ui/MobileKeyboardAvoidingView.tsx` | N | New | 0 | 0 | 0 | 0 | 0 | New -> 10 |
| `native-ui-tests/TabletKeyboardTests.swift` | N | New | - | - | 0 | 0 | 0 | New -> 10 |
| `src/workspace/mobileEditorCommands.ts` | E | 1 Opengrep Error, others 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/workspace/mobileEditorCommands.test.ts` | E | All 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/screens/TabletWorkspace.tsx` | E | All 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/screens/PhoneWorkspace.tsx` | E | All 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/ui/mobileParityInventory.ts` | E | All 0 | 0 | 0 | 0 | 0 | 0 | Unscorable data, 0 warnings |

Reports: `verified-*.json`, except the final registry is
`commit-mobileEditorCommands.json` and the inventory is
`commit-parity-inventory.json`. Every `errors` and `issues` array was inspected;
all expected tool result rows completed. The first command-test scan omitted the
test because of repository exclusions, and was rejected as incomplete. Its
replacement uses the same analyzer configuration with file exclusions removed
in an evidence-only config (`codacy-tests.config.json`), targeting that exact file.
No repository analyzer rule or exclusion was weakened. Logs retain this history.

Refactoring: action lookup is own-property checked and rendered as a component;
localized title maps contain keys instead of dynamic function calls. Editor
registrations use object identity instead of an unnecessary numeric token counter.
Command forwarders are created during registration, not by accessing refs during
render. An intermediate CodeScene 9.68 and ESLint finding were fixed, not waived.

Other record fields: localization has no UI copy changes; `pnpm l10n:validate`
passes all 21 catalogs / 1,193 English keys. PostHog: no event needed because these
are layout/focus corrections to existing actions; recording keyboard appearances
would add noise. ADRs: none. Docs: this record, the resumption assessment, native
test README, and `docs/ABSTRACTIONS.md`. Desktop/Rust coverage was not rerun under
the scoped mobile workflow; this is not a release coverage result. Dashboard
baselines, roster parity, and exact-SHA findings remain **unavailable**, covered
only by the temporary owner-approved exception above.

Final pre-commit checks: `keyboard-commit.xcresult` passes the native focus-handoff
regression again in 18.5 seconds. `commit-native-layout.log` passes 181 native
all-panels/WYSIWYG metrics; `commit-native-persistence.log` passes native WYSIWYG
save/persistence with 116 metrics in its isolated vault. Manual Simulator clicks,
typing, software-keyboard toggling, form cancellation, and search entry confirm
the primary paths; dragging the form body dismisses the keyboard as configured.
`mobile:lint`, `mobile:typecheck`, focused action-sheet/command tests, and locale
validation pass. The normal scoped commit/push hooks remain enabled.

CodeScene staged delta: `no-issues-found`, all nine eligible files checked
(`codescene-staged.json`); no warnings. The MCP safeguard remains unavailable,
not reported as a passing MCP result. Project scores immediately before commit
remain Hotspot 10.0 / Average 9.991289158049293 against floors 10.0 / 9.99.
Demo fixture Git status is clean. No original user-vault content was edited.

Remaining scope: selected-note read recovery, narrow-window panel affordances,
other keyboard-driven overlays, Android/device QA, and the broader launch gaps
in the resumption assessment are not completed by this keyboard checkpoint.

The first normal commit attempt was rejected by the parity inventory test because
the new keyboard wrapper was not yet listed. The inventory now explicitly records
its desktop viewport reference, native-only rationale, and native assertions.
The data-only inventory has no scorable CodeScene functions before or after; it
must retain zero findings, not be represented as a 10-point code score.

### Command palette follow-through

The keyboard checkpoint was committed and pushed as `c98da99fb` with normal
hooks: mobile lint/types, 1,264 tests across 205 files, Expo web export, and the
project CodeScene threshold check passed. The web export is a build gate only,
not the native QA evidence. The unavailable dashboard gates remain excepted.

Manual native inspection then reproduced command results hidden behind the full
software keyboard. `palette-red.xcresult` records the failing native panel-bound
assertion. The palette now reuses `MobileKeyboardAvoidingView`, constrains the
result scroller, and retains its existing desktop-derived width, spacing, input,
and typography. Surface and content styles are separated within the same file
to keep the CodeScene method-size gate at 10; no dependency or new UI copy.

`TabletCommandPaletteKeyboardTests` checks the whole palette above the actual
software keyboard, the existing 540-point width, both rotation directions,
search input, and a real tap on Go to All Notes followed by the exact note-list
title. The first post-fix run passed geometry but exposed a test query relying
on a flattened accessibility ancestor; the final assertion uses the existing
`note-list-toolbar-title` test ID and still verifies the exact displayed label.

This follow-through's code manifest, relative to `apps/mobile/`, is below. The
severity and analyzer identities are the same as the preceding table. Complete
branch and untracked inventories are `palette-branch-manifest.txt` and
`palette-untracked-manifest.txt`; full per-file reports retain every tool row.

| File | Kind | Baseline | B | E9 | O | T | L | CodeScene |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/components/workspace/MobileCommandPalette.tsx` | E | All 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `native-ui-tests/TabletCommandPaletteKeyboardTests.swift` | N | New | - | - | 0 | 0 | 0 | New -> 10 |

Local reports: `before-command-palette.json`,
`palette-MobileCommandPalette-tsx.json`, and `palette-scroll-tests-final.json`.
Every relevant analyzer must complete and retain zero findings at every severity;
no remote dashboard result is inferred. Focused command-model/parity tests pass
(28 tests). Final native and staged-delta results follow after verification.
Localization: no UI copy changes. PostHog: no event needed for correcting the
keyboard layout of existing commands. ADRs: none. Docs: this record, the native
test README, and the keyboard/command-palette abstraction descriptions. The
same scoped exception, expiry, and no-release-approval restriction apply.

Final native result: `palette-scroll.xcresult` passes both orientations in 43.2
seconds, including a real result-list drag that moves the command row more than
60 points without executing it or dismissing the keyboard. This was added after
a CUA mouse drag unexpectedly selected a command; the deterministic native touch
assertion is the scroll evidence. `palette-verified.xcresult` also passed the
preceding geometry/navigation checks. At landscape 1376 x 1032, palette bounds
are x=418, y=100, width=540, height=431; the software keyboard begins at y=585.875.
In portrait, palette width remains 540 and its existing 520-point maximum height
fits above the keyboard. Final bundle: `palette-verified.js` with Hermes `-O`.

Manual inspection on the app-local Laputa copy confirms the new palette above
the full software keyboard. No note content was changed there. That copy contains
5,867 open and 169 archived notes; it is not the original user vault. Some XCTest
rotation screenshots retain stale image orientation/cropping, so numeric native
frames and the separately observed Simulator window are the geometry evidence,
not those malformed screenshots alone.

Final CodeScene staged delta: `no-issues-found`, both code files checked
(`palette-codescene-staged.json`); file scores 10/10 and project scores unchanged
at 10.0 / 9.991289158049293. Local per-file scans completed without findings or
analyzer errors. Typecheck and 28 focused command/parity tests pass. Normal scoped
commit/push hooks remain enabled. Demo fixture Git status remains clean. Full
desktop/Rust coverage, Android, physical-device and floating-keyboard QA were not
run; this checkpoint does not waive those launch requirements.

### Selected-note read recovery

Starting commit: `762aafaf1`. Project CodeScene remains Hotspot 10.0 / Average
9.991289158049293 against floors 10.0 / 9.99. A failed lazy note read now exposes
a localized Retry state instead of mounting an editable placeholder. A successful
empty-file read is still editable. Cancelled replies cannot replace newer drafts;
frontmatter/property/relationship mutations cannot manufacture content for an
unread note. Hydration itself remains available in read-only repositories.

Red evidence: `recovery-red-behavior.log` contains four failing regressions before
the reducer/persistence fixes; `recovery-web-red.log` fails the missing recovery
surface assertion. Green evidence: `recovery-tests-final.log` passes 82 focused
tests across five files, `recovery-web-green.log` passes the host read/retry/edit
smoke flow, and `recovery-types.log` passes mobile typechecking.

Native QA used the actual standalone iPad app and its isolated Laputa copy. One
disposable organized QA note was indexed, then moved outside that vault. Selecting
it produced the error state; retry and a favorite action did not recreate its
missing file. Restoring the original file and tapping Retry opened its original
WYSIWYG body. Typing a paragraph saved that paragraph while preserving all four
frontmatter fields. The QA note was removed after navigating away. Evidence:
`recovery-native-unreadable.png`, `recovery-native-edited.png`, and
`recovery-native-saved-note.md`. Original user-vault notes were not edited.

The per-file manifest below is relative to `apps/mobile/`; analyzer identities and
zero-severity definitions are the same as above. Reports are named
`recovery-before-*` and `recovery-after-*` in the evidence directory. Null CodeScene
scores are type-only files with no findings, not fabricated ten-point scores.

| File | Kind | Baseline | B | E9 | O | T | L | CodeScene |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/screens/useTabletWorkspaceController.ts` | E | 1 Biome Info | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/screens/TabletWorkspace.tsx` | E | All 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/screens/PhoneWorkspace.tsx` | E | All 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/screens/tabletWorkspaceTypes.ts` | E | All 0 | 0 | 0 | 0 | 0 | 0 | Null, no warnings |
| `src/screens/TabletEditorPanel.tsx` | E | 1 Biome Info | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/screens/TabletEditorPanel.types.ts` | E | All 0 | 0 | 0 | 0 | 0 | 0 | Null, no warnings |
| `src/screens/TabletEditorPanelChrome.tsx` | E | All 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/screens/tabletWorkspacePersistence.ts` | E | All 0 | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/workspace/mobileWorkspaceEditing.ts` | E | 3 Opengrep Error | 0 | 0 | 0 | 0 | 0 | 10 -> 10 |
| `src/workspace/mobileNoteRead.ts` | N | New | 0 | 0 | 0 | 0 | 0 | New -> 10 |
| `src/screens/useMobileNoteRead.ts` | N | New | 0 | 0 | 0 | 0 | 0 | New -> 10 |
| `src/workspace/mobileNoteRead.test.ts` | N | New | 0 | 0 | 0 | 0 | 0 | New -> 10 |
| `tests/mobile-note-read-recovery.spec.ts` | N | New | 0 | 0 | 0 | 0 | 0 | New -> 10 |

Refactoring: typed handler maps replace dynamic object calls; a literal suffix
operation replaces a dynamic regular expression; type-only imports are explicit.
Localization: two English messages translated with `pnpm l10n:translate`; the
additional Belarusian Latin catalog is aligned manually because it is not a Lara
target. `pnpm l10n:validate` passes 21 catalogs / 1,195 keys. PostHog: no new event
needed for recovery of the existing note-open operation; no note/error content is
added to telemetry. ADRs: none (bug fix, no dependency or storage change). Docs:
this record and `docs/ABSTRACTIONS.md`. Desktop/Rust coverage and Android/physical
device QA were not rerun. Cloud analyzer results remain unavailable under the
same temporary exception; this is not launch/release approval.

Final staged CodeScene delta: `no-issues-found`, all 13 eligible files checked
(`recovery-codescene-staged.json`). Every expected local analyzer completed with
zero findings and zero errors. Complete branch/untracked inventories are
`recovery-branch-manifest.txt` and `recovery-untracked-manifest.txt`. Demo fixture
Git status is clean; the disposable simulator note is absent after autosave.
