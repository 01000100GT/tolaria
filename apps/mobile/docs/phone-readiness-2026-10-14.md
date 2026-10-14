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
| Startup | Reopening a local vault must not block on a full disk scan/index rebuild | iOS restore indexing moved to native background queue; snapshot retained across parent rerenders. Native large-vault restore passes; cold-launch end-to-end latency and persistent cache remain follow-up work |
| Telemetry | Desktop-aligned PostHog events and Sentry with explicit mobile/device attribution and privacy controls | Implemented with independent consent; native fatal crashes, source-map upload and dashboard acceptance remain explicit release follow-ups |
| GitHub sign-in | iPhone returns successfully from Safari authorization and finishes sign-in despite transient network interruptions | User confirms GitHub approved the code. Recovery regressions reproduced; retry fix passes focused tests, native/device acceptance pending |
| iPad Properties | Tapping property values and relationship controls responds immediately and opens the appropriate action | Removed repeated vault-wide resolution in relationship picker; Type, URL, Tags and relationship dialogs open in native large-vault QA. Physical-device acceptance still pending |
| Beta distribution | Installable beta with a reliable update path, without requiring testers to build source | User requested TestFlight preparation after current fixes; toolchain/account/release-gate assessment pending |

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

## GitHub return-from-Safari recovery

- GitHub approved the user's device code, but Tolaria reported a connection
  failure on return. The previous polling loop treated its first interrupted
  network request as terminal, discarding the sign-in attempt.
- Six focused regressions cover interrupted token polling, interrupted identity
  verification, request timeout, deadline expiry, immediate cancellation and
  explicit denial. Five failed before the change; all six pass afterward, along
  with existing authorization, request and cancellation coverage (23 tests).
- Transient retries use exponential backoff and the original device-code
  deadline. GitHub slow-down responses retain their additional five-second
  interval. Denial and cancellation never retry. An issued token remains only in
  memory until the account identity is verified and the existing secure store
  persists the session. No credentials or response bodies are logged.
- Release device build succeeds and is installed on the physical iPhone.
  End-to-end approval/return acceptance is awaiting the user's retry; the
  deterministic failure tests are not represented as live GitHub acceptance.
- Exact code manifest: `githubAuth.ts` (existing),
  `githubSignInRecovery.test.ts` (new), both under `src/workspace/git/`.
  CodeScene: existing 10 -> 10; new 10. All ten per-file local analyzer runs
  completed with zero findings at every severity and zero errors; existing
  zero baseline stayed zero. Evidence and full branch-path manifest:
  `/Volumes/Jupiter/Cache/tolaria-mobile-auth-20261014`.
- CodeScene project baseline: Hotspot 10 / Average 9.991524406635728. Cloud
  Codacy still lacks authentication after two retries; MCP remains unavailable.
  The existing time-bounded owner exception applies, not a release waiver.
- Localization: no UI copy changes. PostHog: no event needed for restoring an
  existing sign-in flow. No dependency or ADR; Abstractions documents retry
  ownership. No vault data was changed.

## October 14 startup and properties performance

- Restored iOS vaults now receive an asynchronously loaded native file index
  before publication. Native indexing shares the mutation lock, checks the
  managed root and pending checkout, and recovers interrupted writes first.
  Older native builds/other platforms retain their existing fallback. Indexing
  errors surface instead of silently falling back to a blocking JavaScript scan.
- Equivalent parent renders retain the loaded snapshot and repository request.
  Vault changes and explicit selection revisions invalidate the snapshot. This
  is not a persistent cache: cold launch still indexes and constructs metadata.
- The relationship picker resolved one existing target 1,000 times in the red
  regression. It now resolves it once, preserving excluded targets and search
  results. A pre-existing dynamic-object-dispatch scanner finding was removed
  by storing built-in view resolvers in a Map.
- Focused Vitest: 37 passing tests; native WorkspaceFileIndexTests: 5 passing.
  iOS Release build succeeds. Computer-use QA against 5,867 active Laputa notes
  verifies cold restoration and opens Type, URL, Tags and relationship dialogs
  on the first post-tap observation. Dialogs were cancelled without saving.
  Tool observation latency is not reported as measured app response latency.
- Evidence: `/Volumes/Jupiter/Cache/tolaria-mobile-startup-20261014`, including
  exact manifest, before/after per-file reports, failing/passing tests and builds.
  All ten code files end at CodeScene 10 or unscorable with zero findings;
  existing scorable files preserve 10. Native bridge extraction restored its
  method-size gate before commit. Local analyzer results are recorded per file;
  cloud Codacy/MCP remain unavailable under the existing time-bounded exception.
- Localization: no UI copy changes. PostHog: no additional event for eliminating
  repeated computation in existing actions. No dependency/storage-strategy ADR;
  Abstractions updated. No full desktop/Rust release coverage run.
- Commit `36539b351` passed normal hooks and was pushed to
  `origin/mobile-ui-foundation`: lint, typecheck, 1,533 tests / 263 files and web
  export pass. CLI staged delta checked all ten eligible code paths with no
  issues; the unavailable MCP safeguard is not claimed as passed. After push,
  project Hotspot is 10.0 and Average is 9.991524406635728. Forty-eight local
  analyzer/file runs completed successfully: zero Critical, High, Medium, Minor,
  Info or unclassified findings. Existing suggestions-file baseline improved
  from one finding to zero; other existing zero baselines stayed zero. Codacy
  Cloud exact-SHA verification remains unavailable after two authenticated-CLI
  attempts report a missing API token, under the recorded exception.
- Both physical-device installations succeeded without uninstalling or resetting
  app data. Remote launches were denied because both devices were locked.
  Simulator Laputa SHA-256 verification: 6,036 files before/after, zero changed,
  added or removed files. Demo-vault Git status is empty.
- All three existing PhoneReadinessTests pass on the updated native iPhone
  Release app: source-mode preservation through Properties, property Save above
  the software keyboard, and compact landscape formatting with one Properties
  header. Result: `phone-regression.xcresult`. Tests use the isolated fixture,
  not the user vault; the iPad large-vault checks above use real read-only data.

## TestFlight preparation assessment

Requested after the current fixes. This is a readiness assessment, not a beta
release approval or a claim that telemetry and all phone acceptance are finished.

1. Confirm the Apple Developer Program team and access to App Store Connect.
   Local device signing proves a development identity exists, not that the app
   record, distribution signing or CI upload permissions are ready. This host
   currently has one Apple Development identity and no Apple Distribution
   identity. No App Store Connect upload credential was found in the current
   process environment; account state has not been inspected.
2. Decide the permanent bundle identifier before creating the app record. The
   installed app is `com.tolaria.mobile.dev`. A separate release identifier is
   advisable, but its availability is unverified. Changing it creates a separate
   sandbox and Keychain scope: existing testers must retain the development app
   until their vaults are safely imported or cloned into the beta.
3. Build with a supported toolchain. Local Xcode reports 16.2; the repository's
   current macOS CircleCI executor selects 16.4. Apple requires Xcode 26 or later
   and the iOS/iPadOS 26 SDK for App Store Connect uploads since April 28, 2026.
   Add a dedicated mobile archive/sign/upload lane to CircleCI, retaining it as
   the authoritative release system. EAS Build/Submit is an optional delegated
   build service, not a replacement CI system. Neither route is configured yet.
4. Configure distribution signing, unique build numbers, release environment,
   GitHub public OAuth configuration, privacy manifests and export-compliance
   answers, beta description, feedback contact and test instructions. Keep
   private signing/upload/Sentry source-map credentials in CI secrets, never
   EXPO_PUBLIC variables or committed configuration. Audit actual collected
   telemetry before completing privacy disclosures.
5. Restore the full release gates, including cloud analyzer verification, and
   verify the signed release on both physical devices: GitHub return flow,
   representative vault startup, property editing, save/reopen, offline/resume
   and conflict-safe sync. The experimental analyzer exception is not a waiver
   to distribute a beta.
6. Upload to TestFlight and test internally first; then invite external testers
   after the first beta review. Testers install/update through TestFlight without
   Xcode or a source checkout. Builds expire after 90 days. Start with binary
   updates only; OTA adds another compatibility/release surface and is not needed
   for the first beta. Native module changes always need a new binary.

Official references checked October 14:
[Apple upload requirements](https://developer.apple.com/news/upcoming-requirements/),
[TestFlight workflow](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/),
[Expo iOS builds](https://docs.expo.dev/build-reference/ios-builds/).

## October 14 telemetry batch

### October 14 analyzer exception extension

- Approver: Luca, repository owner, explicitly approved the requested extension
  in this chat on October 14 and authorized reusing desktop telemetry keys.
- Expires: October 15, 2026 at 14:12 UTC (16:12 Europe/Rome), or earlier when
  access returns. Review/remove within seven days; this is not a release waiver.
- Blocked commands: `codacy tools gh refactoringhq tolaria --output json`
  failed twice again with `No API token found`; CodeScene MCP is absent from
  the available tool inventory. Cloud baseline, analyzer parity, exact-SHA
  verification and MCP safeguards are unavailable, not passing.
- Scope: mobile startup/authentication/properties fixes and mobile PostHog/Sentry
  integration, settings, dependencies/build configuration, focused tests,
  localization and architecture documentation. Exact paths recorded in each
  batch manifest under `/Volumes/Jupiter/Cache/tolaria-mobile-telemetry-20261014`.
- Risk: local analysis cannot prove cloud parity; crash reporting introduces a
  privacy-sensitive transport. No thresholds or suppressions are weakened.
- Compensation: per-file before/after local Codacy and CodeScene CLI, staged
  delta, project API floors, focused privacy/consent/payload tests, scoped mobile
  gates, native QA and inspection of bundled configuration without exposing
  credentials. Baseline Hotspot 10 / Average 9.991524406635728 (floors 10 / 9.99).

### Implementation

- Desktop public PostHog key, EU ingestion host and Sentry DSN recovered from
  the official desktop release and saved only in ignored `.env.local`. Native
  Release bundle inspection confirms all three values without printing them.
  Expo config also accepts the existing desktop `VITE_*` environment names;
  private source-map upload credentials never enter the application manifest.
- PostHog retains the bounded, consent-only transport and ephemeral anonymous
  session ID. Desktop-aligned events: `note_created`, `note_deleted`,
  `vault_opened`, `vault_switched`, `search_used`, `commit_made` and
  `theme_mode_changed`. Create/delete fire after successful persistence; manual
  commits fire only when files changed. Requested operations stay distinct.
- Both services include `app_surface=mobile`, `platform`, `device_family`,
  `app_version`, `build_number`, `release_channel` and `distribution`. No vault
  names, paths, note content or GitHub identity are sent or used to link devices.
- Official Sentry React Native SDK, matching core/CLI, Expo plugin and Metro
  integration. Crash reporting has independent default-off persisted consent.
  SDK loading is lazy; revocation aborts requests and invalidates old transports.
  Error reports are reconstructed from an allowlist, removing raw messages,
  attachments, breadcrumbs, user/request/extra/context data. Automatic sessions,
  tracing, replay, logs, screenshots and UI capture are disabled.
- Coverage is currently JavaScript errors and caught workspace/persistence
  failures. Native fatal crash capture is intentionally disabled because native
  reports bypass the JavaScript privacy filter. This is not full native-crash
  coverage. Source-map upload and symbolication require private CI credentials,
  Sentry organization/project configuration and server-side verification.

### Verification and remaining gates

- Two safe, explicitly marked synthetic verification events received HTTP 200
  through the actual PostHog and Sentry transports. This proves ingestion
  acceptance, not dashboard visibility or symbolication. No user content was
  included. Evidence: `ingestion-verification.json` in the telemetry directory.
- iOS simulator Release build passes. A pnpm-isolation failure in Sentry's build
  script was fixed by declaring its matching CLI as a mobile dev dependency.
  Local source-map uploads are explicitly disabled without private credentials.
- Focused analytics/privacy tests pass, including old settings migration, payload
  redaction, consent withdrawal, in-flight cancellation and initialization
  failure. Mobile typecheck/lint and localization validation pass. All UI copy
  reuses existing translated desktop keys; no new translation was required.
- Native XCTest: both iPad privacy tests pass (analytics and independent crash
  consent, persistence and revocation); four iPhone tests pass (crash consent
  and the three existing phone readiness regressions). These are Release-native
  app checks, not browser substitutes. The consent tests finish with both off.
  Manual computer-use QA is blocked by the locked Mac; the owner was asked to
  unlock it. This limitation is not represented as passing visual QA.
- Laputa SHA-256 integrity remains 6,036 files, zero additions/deletions/changes.
  Demo-vault status is empty. Native interaction tests use the isolated fixture.
- Per-file local analysis: 147 successful analyzer/file runs, zero Critical,
  High, Medium, Minor, Info or unclassified findings. All zero baselines remain
  zero; the existing Metro config improves from one finding to zero. Manifest,
  analyzer identity/version and per-file results are in `current-manifest.json`,
  `branch-manifest.json` and `local-analyzer-evidence.json` in the evidence folder.
- Refactoring: decomposed crash initialization/redaction helpers to preserve
  CodeScene 10. ADR 0225 and Abstractions document ownership/privacy. Full
  desktop/Rust coverage is not run for this experimental mobile-only batch.
- Cloud Codacy parity/exact-SHA checks and CodeScene MCP safeguards remain
  unavailable under the owner-approved exception above, not passing release
  gates. No TestFlight upload is performed by this batch.

References: [Sentry Expo setup](https://docs.sentry.io/platforms/react-native/guides/expo/),
[PostHog anonymous and identified events](https://posthog.com/docs/data/anonymous-vs-identified-events).

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

## Launcher branding and physical installs

- `apps/mobile/app.json` now uses the `Tolaria` display name and references the
  exact desktop runtime light/dark icon PNGs. The application identifiers are
  unchanged. No new artwork, dependencies, runtime behavior or translated
  strings were introduced. The native display-name/icon assets were regenerated
  with Expo's installed configuration plugins, then compiled into Release builds.
- Evidence directory: `/Volumes/Jupiter/Cache/tolaria-mobile-icon-20261014`.
  The initial shared-icon contract failed before the change; the final contract
  checks name, source paths and stable bundle identity. The compiled simulator
  asset catalog contains both 1024px light/dark variants. Native Home Screen QA
  shows the blue desktop droplet, the accessibility label is `Tolaria`, and
  clicking it launches the app successfully (`home-screen.png`).
- Release build and installation succeeded on the physical iPad and iPhone 13
  Pro Max. Both devices launched successfully; the iPhone was verified after
  the owner confirmed developer-profile trust (`iphone-launch-trusted.json`).
  No device data was reset and no vault files were edited for this check.
- Scan manifest: one existing non-executable Expo JSON configuration,
  `apps/mobile/app.json`, plus this record and `docs/ARCHITECTURE.md`. Its local
  Biome 2.5.6, Opengrep 1.26.0, Trivy 0.72.0 and Jackson 1.0.0 scans each checked
  one file successfully, with zero findings/errors before and after at every
  severity. JSON is unsupported by CodeScene (confirmed on retry), so no file
  Code Health score is claimed and no scorable source file changed. Project
  health remains Hotspot 10 / Average 9.991524406635728 against floors 10 / 9.99.
  Cloud/MCP verification remains unavailable under the previously approved
  exception, expiring October 14 at 14:12 UTC; no production promotion.
- `pnpm l10n:translate` and `pnpm l10n:validate` pass without catalog changes;
  `Tolaria` is the existing product name. PostHog: no event needed for packaging
  branding. Refactoring: none. ADRs: none. Architecture records the shared asset
  source. Demo fixture dirt is empty. Normal mobile hooks apply to commit/push;
  no desktop/Rust coverage run is required for this experimental metadata change.
