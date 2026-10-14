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
  note-list arrows. New native tests reproduce all three failures on iPad;
  implementation and green verification are in progress.
