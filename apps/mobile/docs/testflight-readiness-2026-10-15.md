# TestFlight readiness: October 15, 2026

## Decision

Not ready to distribute. Do not upload or invite testers until the gates below
are green. A simulator Release build is not an App Store distribution archive.
The existing analyzer exception permits the scoped telemetry implementation;
it does not waive release checks. No upload, App Store Connect app creation,
signing-account change or beta invitation has been performed.

## Completed in this batch

- Added consent-bound iOS native crash capture using the Sentry Cocoa SDK
  already included by the React Native dependency. JavaScript capture remains
  independent, and both stop when crash-reporting consent is revoked.
- Native reports contain bounded, address-only stacks, image UUIDs and validated
  build/device metadata. Note content, paths, messages, users, breadcrumbs,
  dynamic symbols, registers and automatic network/UI context are excluded.
- Revocation cancels the native transport and detaches/deletes its cache.
  A later opt-in cannot reopen an old generation. Loading settings no longer
  accidentally revokes persisted consent before crash recovery can run.
- Reports recovered after an update keep the crashed binary's version/build.
  A bounded thread list always prioritizes the crashed thread.
- Added native SDK tests and a simulator-only crash/relaunch proof. The proof
  hook is excluded from physical-device builds.

## Blocking checklist

### Unlocked-Mac follow-up, October 15

Native manual QA resumed after the owner unlocked the Mac. On the installed
iPhone Release build, Properties opens and its type editor can be cancelled
without a mutation. Opening Settings in landscape incorrectly forced portrait
content. A native regression reproduced the failure before the fix; both
landscape orientations now pass on iPhone and iPad. Evidence:
`tolaria-testflight-remediation-20261015/settings-red-v2.xcresult` and the final
phone/iPad acceptance bundles under `/Volumes/Jupiter/Cache`.

The System theme also stayed light when the simulator's appearance was dark.
The Expo manifest forced a light native interface. A failing manifest regression
was added, then the interface style was changed to automatic and the native
binary rebuilt. Screenshots confirm dark system appearance becomes dark in the
app and switching back to light updates the running app. The simulator was
restored to light; the user's theme and telemetry settings were not changed.

The Settings correction and its native regression test fall within the existing
October 14 approval's explicit mobile Settings/focused-tests scope; its expiry
remains October 15 at 14:12 UTC. This does not extend that approval to the broader
desktop/branch release remediation. Codacy Cloud was retried twice and still
reports no API token; the CodeScene MCP remains unavailable. Compensation is
the same per-file local analysis, CodeScene CLI before/after, native regression
and scoped mobile gates. No release gate is waived. Before editing,
`MobileSettingsSheet.tsx` scores 10 and has zero findings from all five relevant
local analyzers. Project Hotspot/Average remain 10 / 9.991563181194524.

The affected code paths for this scoped correction are
`apps/mobile/src/settings/MobileSettingsSheet.tsx` (existing) and
`apps/mobile/native-ui-tests/MobileSettingsOrientationTests.swift` (new).
The same Settings/build-configuration scope covers correcting the forced native
light appearance in `apps/mobile/app.json` and adding
`apps/mobile/src/settings/mobileNativeAppearance.test.ts`. The JSON manifest is
not a scorable CodeScene language; all four relevant local analyzers completed
its baseline with zero findings.

All four paths have final explicit local scans: 17 successful analyzer/file
runs, zero errors and zero findings at every severity. All three scorable files
score 10; the JSON manifest is unsupported by CodeScene after a retry. The
staged CLI check is clean. These results do not establish cloud analyzer parity
or waive the full branch failures below.

Final native acceptance on the rebuilt iOS 18.3 simulators: seven iPhone and
five iPad XCTest checks pass, including Settings orientation, account controls,
phone editor header/properties/keyboard/safe areas, tablet type visibility,
relationship controls and footer bounds. Manual iPad coordinate interaction
still fails in the computer-use tool despite an unlocked Mac; native XCTest
taps provide the recorded interaction evidence, not a claimed manual pass.
Mobile lint/typecheck and all 1,555 tests pass in the normal commit hook. An
earlier concurrent build/test run timed out in three Git tests; all nine Git
tests passed in isolation and the entire hook passed after the native jobs
finished, without increasing timeouts. Orientation fix commit: `773984d4a`.
Localization validation still passes (21 catalogs, 1,242 keys); no UI copy or
new analytics action changed. No new ADR or abstraction was needed. Laputa's
6,036-file SHA-256 comparison shows no changed, added or removed files.

The signed Release-configuration development build succeeded and passed strict
code-signature verification. It was installed over the existing app on the
physical iPad without uninstalling or resetting its sandbox. Launch was denied
because the iPad is locked; this is installation evidence, not physical UI
acceptance. The paired iPhone is not reachable. Evidence: `device-build.log`,
`ipad-install.json` and `ipad-launch.json` in the follow-up evidence directory.
This binary still uses `com.tolaria.mobile.dev` and the existing development
identity; it is not a TestFlight distribution archive.

### Release gates

| Gate | Current evidence | Required next action |
| --- | --- | --- |
| Full frontend tests/coverage | 5,308 passed, one inspector failure; focused retry reproduces it | Fix `InspectorPanels.test.tsx` / Type schema placeholder behavior, then rerun coverage and smoke gates |
| Full branch CodeScene | 1,128 eligible files checked against `origin/main`; 16 existing paths have findings | Refactor those paths and repeat the branch comparison; current-batch cleanliness is not a branch release pass |
| Full release security hook | 117 local differential findings across 60 older branch paths, none in this batch | Triage/fix all findings and verify analyzer configuration; these are not 117 confirmed vulnerabilities |
| Cloud analysis | Codacy CLI reports missing API token after two attempts; CodeScene MCP unavailable | Restore access, verify analyzer parity and exact pushed SHA; do not treat local scans as cloud verification |
| Upload toolchain | Local Xcode 16.2; existing CircleCI macOS lane uses 16.4 | Use Xcode 26+ with iOS/iPadOS 26 SDK in a dedicated mobile CircleCI lane |
| Application identity | Development bundle `com.tolaria.mobile.dev`, version 0.1.0 | Owner confirms permanent release bundle ID and Apple team; proposed `com.tolaria.mobile` / `C83NM98757`, not assumed approved |
| Distribution signing | One local Apple Development identity, no Apple Distribution identity | Configure distribution certificate/profile and App Store Connect upload credentials securely in CI |
| App Store Connect | App record and permissions unverified | Owner provides access; create/verify app record and internal tester group |
| Symbolication | Expo/Metro Sentry integration exists; local QA disables upload | Set private `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` in CI and verify source maps/dSYMs for the exact archive |
| Telemetry acceptance | Prior synthetic ingestion accepted; native crash recovery now proven locally | Verify events in PostHog/Sentry, release/device attribution, symbolication, IP retention and privacy disclosures |
| Native acceptance | Seven iPhone checks, five iPad checks, system-theme switching and prior real crash recovery pass; Mac unlocked | Verify final signed binary on physical devices; computer-use iPad coordinate interaction remains unavailable |
| Live GitHub/sync | Retry and sync regressions covered elsewhere; not end-to-end accepted in this batch | Test Safari return, clone, edit/save, offline/resume and non-conflicting/conflicting sync against a disposable remote |
| Beta metadata | Not submitted | Owner supplies feedback contact, privacy/support URLs and approves privacy/export-compliance answers and test instructions |

The desktop failure is the `shows Type relationship schema properties as
relationship placeholders` case. `has_part` is not accepted by the component's
current schema-key set (`belongs_to`, `related_to`, `has`). Neither desktop file
was modified in this batch. The failure is not suppressed or relabeled as a pass.

### Build and distribution policy

Keep CircleCI authoritative. Add a mobile archive/export/upload workflow only
after the release identity, signing and broader analyzer access/exception are
resolved. Use a unique increasing `CFBundleVersion`; set the release channel and
distribution metadata to the intended beta values. Fail closed on missing
signing credentials, public runtime configuration, source maps or dSYMs.

Never place private upload/signing/Sentry credentials in `EXPO_PUBLIC_*`, the
app manifest or Git. Public PostHog ingestion configuration, Sentry DSN and the
GitHub OAuth client ID may be bundled. Do not use a development OAuth secret.

Use binary TestFlight updates for the first beta. No OTA deployment service is
needed. A different bundle ID has a separate sandbox and Keychain; retain the
development app until users have safely cloned/imported their vaults into the
beta. Never uninstall it as an installation troubleshooting shortcut.

The first candidate should be iOS-only, single-active-vault and internal-test
only. Unfinished share-in, Android acceptance and broader phone polish remain
tracked in `phone-readiness-2026-10-14.md`; do not imply they shipped. System
appearance is now verified on the rebuilt native simulator app; physical-device
and distribution-binary acceptance remain separate requirements.

## Release evidence record

- Base: `8e65f4a81`, branch `mobile-ui-foundation`. Evidence directory:
  `/Volumes/Jupiter/Cache/tolaria-testflight-20261015`.
- Mobile lint/typecheck pass; mobile suite: 1,554 tests in 272 files pass.
  Six standalone Swift SDK/privacy/cache tests pass. Red regressions reproduced
  premature consent revocation and loss of a crashed thread beyond the limit.
- Native Release build succeeds on the iOS 18.3 simulator runtime (Xcode's iOS
  SDK is 18.2). Six iPhone
  XCTest checks cover editor header, keyboard-safe properties, source-mode
  lifetime, landscape formatting, safe areas and independent persisted crash
  consent. Four iPad checks cover consent, type-visibility spacing, relationship
  addition and footer bounds in portrait/landscape.
- A deliberately aborted native simulator process recovered a sanitized Cocoa
  crash on relaunch, with address stacks and image UUIDs. Original settings were
  restored and the test cache was removed. This is not dashboard/symbolication
  acceptance. Native tests use isolated fixtures, not Laputa mutations.
- Full Rust coverage: 86.12% lines, passing the 85% floor. Full desktop coverage
  command fails because one test fails; no passing frontend coverage percentage
  is claimed. Playwright release smoke and physical-device acceptance remain
  outstanding. The unlocked-Mac follow-up above supersedes the earlier manual
  QA interruption, not these release gates.
- CodeScene starting project: Hotspot 10, Average 9.991563181194524; floors
  10 / 9.99. Both existing files started at 10 and remain 10; all 14 new scorable
  files score 10. `Package.swift` has no scorable code and no findings. Builder
  argument grouping fixed the initial 9.68 finding before commit. The MCP
  safeguard/change-set service is unavailable, not passing; CLI evidence is
  recorded separately. Staged CLI delta: 17 eligible files checked, zero findings.
  The full `origin/main` CLI comparison fails with findings in 16 older branch
  files; see the list below. No push is allowed on the strength of the staged
  check alone. Final project API scores remain 10 / 9.991563181194524, but those
  scores do not override the failing change-set result.
- Codacy: `branch-manifest.json` enumerates added/modified paths against the
  merge base with `origin/main`; `batch-manifest.json` classifies all 21 touched
  code/config files in this batch. `Package.resolved` is a generated dependency
  lock, not executable code. Per-file raw reports are under `final/` and
  `local-analysis.json` records analyzer identities, status and counts. Dashboard
  analyzer parity and exact-SHA verification remain unavailable, not zero.
- Existing-file local baselines: `MobileAnalyticsProvider.tsx` and
  `mobileSentry.ts` each have five successful analyzer runs and zero findings.
  Each final file must remain zero; each new file must be zero in its entirety.
  All severity categories are counted, including Info and unclassified.
- Final local scans: all 21 files have successful explicit scans, totaling 75
  analyzer/file runs. Every run analyzed its requested file, with zero errors
  and zero Critical, High, Medium, Minor, Info or unclassified findings. Existing
  zero baselines remain zero. TypeScript uses Biome, ESLint9, Semgrep, Trivy and
  Lizard; Swift uses Semgrep, Trivy and Lizard; JSON uses Biome, Semgrep, Trivy
  and Jackson; podspec/privacy XML use Semgrep and Trivy. Local analyzer
  versions/capabilities are in each raw report. Cloud equivalence is unverified.
- Localization: no UI copy changes; validation passes for 21 catalogs against
  1,242 English keys. PostHog: no additional event is needed for
  crash-capture coverage; existing consent/events and mobile/device attribution
  remain in force. Crash reports use Sentry, not analytics events.
- ADR 0226 records the native privacy/consent/cache boundary; Abstractions is
  updated. Refactoring: configuration builder and native privacy decomposition.
- Laputa: SHA-256 comparison of all 6,036 files shows zero changed, added or
  removed files. `git status --short -- demo-vault demo-vault-v2` is empty.

### Commit and release-hook result

Implementation commit: `bfbd447c7`. Normal pre-commit hooks pass: mobile lint,
typecheck and all 1,554 tests. The standalone full hook was then run with
`TOLARIA_MOBILE_FULL_GATE=1 sh .husky/pre-push < /dev/null`. It exited 1 at
`pnpm codacy:gate`, before subsequent build/coverage/smoke stages. The separate
full desktop/Rust runs above are still recorded, not substituted for that gate.

The differential hook reports 117 findings over 60 earlier branch files, zero
in this batch. Its legacy ESLint8/security configuration is not the same roster
as the explicit per-file ESLint9 scans; restore cloud parity before interpreting
the discrepancy. Findings include lint/style, accessibility and security-rule
matches, some in test fixtures. None are dismissed as false positives without
analysis/approval. Exact file/line/rule records are retained in
`full-release-findings.json`; the original output is `full-release-hook.log`.

No push was attempted with a known failing full change-set/hook. The new commit
is local, and Codacy exact-pushed-SHA verification is therefore outstanding.
Broader remediation is blocked on restoring cloud access or obtaining the
requested, narrowly scoped unavailable-service exception. That exception would
permit preparation only, not bypass these failing release gates.

### Full branch CodeScene remediation

These are existing paths relative to the start of this batch, not regressions
introduced by the native crash integration. Full details are retained in
`codescene-origin-main.json`; the comparison exited unsuccessfully.

| File | Score |
| --- | --- |
| `apps/mobile/src/qa/nativeLayoutMetrics.ts` | 8.28 |
| `apps/mobile/src/workspace/mobileWorkspaceEditing.test.ts` | 9.38 |
| `apps/mobile/src/qa/nativeWorkspacePersistenceProbeRepository.ts` | 9.09 |
| `src/components/tolariaCollapsedSections.ts` | 8.54 |
| `src-tauri/src/commands/sheet.rs` | 9.38 |
| `apps/mobile/src/components/workspace/MobileWysiwygWikilinkBridge.test.ts` | 9.38 |
| `apps/mobile/src/qa/nativeWysiwygFormatCommandProbe.ts` | 9.44 |
| `apps/mobile/src/workspace/mobileTypeDefinitions.ts` | 9.68 |
| `apps/mobile/src/qa/nativeMobileCommandPaletteProof.ts` | 9.66 |
| `apps/mobile/src/qa/nativeMobileActionAdapterProof.ts` | 9.66 |
| `apps/mobile/src/screens/tabletWorkspaceRelationshipActions.test.ts` | 9.38 |
| `apps/mobile/src/screens/tabletWorkspaceTypeDefinitionSave.ts` | 9.68 |
| `apps/mobile/src/components/workspace/MobileWysiwygExternalLinkBridgeModel.ts` | 9.50 |
| `src/utils/sheetWikilinks.ts` | 9.68 |
| `apps/mobile/src/screens/tabletWorkspaceTypeDefinitionFields.ts` | 9.68 |
| `apps/mobile/src/workspace/mobileTypeNames.ts` | 9.53 |

### Analyzer exception, not a release waiver

The owner's October 14 approval in `phone-readiness-2026-10-14.md` covers this
mobile telemetry batch, including native integration/build configuration and
tests. It expires October 15 at 14:12 UTC (16:12 Europe/Rome), or when access
returns; review/remove within seven days. Blocked commands/services, risk and
compensating checks are recorded there and in this batch's evidence directory.
The requested extension for broader TestFlight preparation has not been
confirmed and is not assumed. No rule suppression or lowered threshold is used.

## Official references

Checked October 15, 2026:

- [Apple upload requirements](https://developer.apple.com/news/upcoming-requirements/): Xcode 26 and iOS/iPadOS 26 SDK minimum since April 28, 2026.
- [Apple TestFlight workflow](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/): internal testing, external beta review and expiring builds.
- [CircleCI Xcode images](https://circleci.com/docs/guides/execution-managed/using-macos/): select a currently supported Xcode 26 image for the mobile lane.
