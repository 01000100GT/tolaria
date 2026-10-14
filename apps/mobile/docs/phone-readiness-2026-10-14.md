# Phone readiness

## Accepted scope

Track the complete phone review, not only the last request. Use isolated fixture
vaults or disposable copies for mutation tests; leave Laputa unchanged.

| Area | Acceptance | Status |
| --- | --- | --- |
| Forms | Save remains reachable with software keyboard; remove locked definition clutter | In progress |
| Navigation | Preserve editor mode/caret and list position across navigation and rotation | In progress |
| Formatting | Compact phone toolbar in both orientations; keyboard dismissal and visible caret | In progress |
| Header | Back, title, Properties and More; secondary actions remain discoverable | Pending |
| Properties | One header, note context and existing values before empty schema suggestions | In progress |
| Wide content | Contained tables/code/links without stealing panel gestures | Pending |
| Share-in | Receive text, URLs and files through the system share sheet | Pending |
| Local vault | Create an on-device vault without GitHub or a preexisting folder | Pending |
| Android | System Back and linked-folder support; actual native verification | Pending; SDK not found at the default local path |
| Accessibility | 44-point targets, Dynamic Type, VoiceOver and Reduced Motion | In progress |
| Acceptance | Small/large phones, rotation, keyboard, offline/resume, large copied vault, iPad regressions | In progress |

## Baseline and evidence

- Branch: `mobile-ui-foundation`; starting commit `b9f8d5988`.
- Starting CodeScene: Hotspot 10.0, Average 9.991524406635728; floors 10 / 9.99.
- Cloud Codacy retried twice: missing API token. CodeScene MCP unavailable.
  The owner's existing scoped exception is recorded in
  `ipad-review-2026-10-11.md` and expires October 14 at 14:12 UTC. It is not
  renewed by this document and does not waive production release gates.
- Evidence directory: `/Volumes/Jupiter/Cache/tolaria-phone-readiness-20261014`.
- Installed and launched the verified starting Release build on the connected
  physical iPad, without resetting its app data or launching fixtures there.
- Native iPhone red tests reproduce hidden property Save, landscape toolbar
  expansion, and loss of a source mode selected after launch. A launch-directly-
  in-source test was insufficient and was strengthened before the state fix.
- First phone batch: all three `PhoneReadinessTests` now pass on the native
  iPhone simulator (`phone-green-2.xcresult`). The tests cover source-mode
  preservation, keyboard-safe property Save and compact landscape formatting.
- Scoped mobile model suite: 1,517 tests passed for the phone batch; 1,518
  passed after the new pane-shortcut regression was implemented. Mobile lint
  and typecheck pass for the phone batch. No desktop/Rust full suite or release
  coverage measurement was run in this experimental workflow.
- Phone batch manifest: `batch-1-manifest.json`. All twelve code files have
  individual successful local analyzer runs with zero findings/errors at every
  severity. All scorable files finish at CodeScene 10; the declarative device
  layout model is unscorable with no findings. Existing scores remain 10.
- Localization: no UI copy changes. PostHog: no event needed for corrections to
  existing navigation, keyboard-safe layout and orientation behavior. ADR 0224
  and Architecture document screen lifetime and native device-layout policy.
- Latest iPad feedback is also in scope: hardware Cmd+K, pane shortcuts and
  note-list arrows. Native regressions reproduced the failures before the fix;
  the completed keyboard batch is recorded below.

## iPad keyboard batch

Native shortcut delivery now uses a stable subscription and a first-responder
root controller. Cmd+K opens the command palette from the workspace and either
editor mode. Up/Down select palette results, Return executes and Escape closes.
Cmd+1 shows the editor, Cmd+2 the editor/list, Cmd+3 all left panels, and
Cmd+Shift+I toggles Properties. Existing search, new-note, find and source-mode
shortcuts retain their handlers. Note-list arrows are disabled while a text
input, palette or action sheet owns focus, and when the list is hidden.

### Native and focused QA

- `TabletHardwareKeyboardTests`: one continuous native iPad session passes
  pane shortcuts, Properties toggle, repeated Cmd+K, touch command execution,
  and Cmd+K from focused rich-text and source editors
  (`keyboard-session-final.xcresult`).
- Native clicks plus AXe HID events pass all four cases of
  `scripts/assert-ios-keyboard-navigation.mjs`: `notes`, `palette-dismiss`,
  `palette-select`, and `source`. The source check asserts the selected note
  after each individual arrow. Logs: `keyboard-hid-*-pass.log`.
- XCTest on this iOS 18.3 simulator drops special arrows/Return during character
  map normalization. Those failed driver attempts are not passing app evidence.
  The supplemental checks send actual HID events and inspect native
  accessibility state, without invoking app callbacks or injecting JavaScript.
  Set up each fixture screen using native clicks before running the relevant
  case; AXe tap-coordinate translation was unreliable after simulator rotation.
- Final native iPhone build: all three `PhoneReadinessTests` pass again
  (`phone-keyboard-regression.xcresult`).
- `pnpm mobile:lint`, `pnpm mobile:typecheck`, `pnpm mobile:test` pass:
  259 files, 1,518 tests. `pnpm mobile:export:web` passes. Focused Playwright
  command execution and initial screenshot checks pass on the completed export:
  5 passed, 4 intentionally excluded by device project
  (`keyboard-web-focused-final.log`). No full desktop/Rust suite or release
  coverage measurement was run under the scoped experimental mobile workflow.
- Updated Release build installed and launched on Luca's physical iPad at
  approximately 12:53 Europe/Rome, without fixture arguments or resetting data.
  Simulator mutation checks used only the in-memory fixture; Laputa was not
  edited. `git status --short -- demo-vault demo-vault-v2` is empty.

### Analyzer manifest and release record

Paths below are relative to `apps/mobile/`. Every final file has CodeScene 10.0
and zero local findings at every severity. Counts are local Codacy CLI counts,
not cloud dashboard results.

| Exact path | CodeScene before/after | Local findings before/after |
| --- | --- | --- |
| `modules/tolaria-key-commands/ios/TolariaKeyCommandsModule.swift` | 10 / 10 | 0 / 0 |
| `src/components/workspace/MobileCommandPalette.tsx` | 10 / 10 | 0 / 0 |
| `src/native/mobileNativeKeyCommandsContract.ts` | 10 / 10 | 0 / 0 |
| `src/qa/nativeMobileKeyboardShortcutProofContract.ts` | 8.67 / 10 | 0 / 0 |
| `src/screens/PhoneWorkspace.tsx` | 10 / 10 | 0 / 0 |
| `src/screens/TabletWorkspace.tsx` | 10 / 10 | 0 / 0 |
| `src/workspace/mobileWorkspaceKeyboardShortcuts.test.ts` | 10 / 10 | 0 / 0 |
| `src/workspace/mobileWorkspaceKeyboardShortcuts.ts` | 9.38 / 10 | 2 / 0 |
| `native-ui-tests/TabletHardwareKeyboardTests.swift` | new / 10 | new / 0 |
| `scripts/assert-ios-keyboard-navigation.mjs` | new / 10 | new / 0 |

- Evidence: `keyboard-manifest.json`, `keyboard-branch-scan-manifest.json` and
  `keyboard-final-analyzer-manifest.json` in the evidence directory. The latter
  records exact paths/hashes, analyzer identities, completed file counts and
  Critical/High/Medium/Minor/Info/unclassified counts for every file/tool pair.
- TS/TSX scans completed with Biome, ESLint 9, Opengrep, Trivy and Lizard.
  Swift completed with Opengrep, Trivy and Lizard. MJS completed with ESLint 9,
  Opengrep, Trivy and Lizard; Codacy routed no MJS file to Biome, so the same
  bundled Biome was run explicitly: one file checked, none skipped, zero
  diagnostics (`keyboard-hid-biome.json`). This is supplementary local evidence,
  not proof of cloud analyzer parity.
- CodeScene project before/final check: Hotspot 10.0 and Average
  9.991524406635728, above the 10 / 9.99 floors. Staged CLI delta is the
  compensating safeguard; the normal verified mobile push repeats the project
  gate. The final handoff records the delta/push result and commit SHA.
- Cloud Codacy exact-SHA results, cloud file baselines/parity and CodeScene MCP
  safeguard/change-set calls remain unavailable under the existing owner
  exception expiring 2026-10-14 14:12 UTC. They are not reported as passing;
  this is not production release approval.
- Refactoring: simplified shortcut dispatch and probe action parsing to restore
  both sub-10 files to 10. No suppression or quality threshold change.
- Localization: no UI copy changes. PostHog: no event needed because this repairs
  existing command delivery and focus ownership, rather than adding a distinct
  product action. Architecture documents the native keyboard routing and QA.
  ADRs: none for this keyboard repair; ADR 0224 belongs to the earlier phone
  screen-lifetime batch. The remaining phone scope above is still pending.
