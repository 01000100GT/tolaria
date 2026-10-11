# Native Mobile Interaction Tests

These XCUITest checks drive the **standalone iOS app**, not Safari, Expo web,
or synthetic JavaScript gesture callbacks. They can run without operating the
Mac's Simulator window. They do not unlock the Mac or change its permissions.

Prerequisites: Xcode, a booted landscape iPad simulator, the current-source
`com.tolaria.mobile.dev` development app installed, Metro on port 8081, and Ruby's
`xcodeproj` gem (already installed alongside CocoaPods on the development host).

```sh
node apps/mobile/scripts/test-ios-panel-gestures.mjs SIMULATOR_UDID /tmp/tolaria-panel-qa
```

The test opens an explicit isolated fixture. It verifies eight transitions:
toolbar properties hide, a long note-list-header drag hiding both left panels, restoring
the list from the editor, restoring the sidebar, properties edge reveal, dismissal
from its surface, and the two toolbar toggles. It also checks that vertical
movement does not collapse the left panels. Native accessibility frames must
match desktop panel widths (260/340/300 points), rather than merely resemble a
screenshot. The result bundle retains a screenshot and Xcode's failure diagnostics.

The runner is reinstalled for every run: unsigned Xcode test bundles were observed
to reuse stale installed test code. This only removes our disposable test runner,
never the Tolaria app, vaults, or account data. Keep the app source stable while
the test runs; Metro Fast Refresh can otherwise invalidate the interaction.

This is an interaction-correctness check, **not** a frame-rate, interruption,
text-selection, physical-device, Android, or large-vault performance certification.
Use the existing layout/persistence probes alongside it, and measure performance
on representative data in a release build before launch.

`TabletKeyboardTests` covers long workspace forms, short folder forms, and native
WYSIWYG formatting with a real software keyboard, including rotation while it
remains open and opening a form from an already-focused WYSIWYG editor. It checks actual screen-coordinate button/keyboard bounds and
hittability, not web layout or a synthetic keyboard inset. Enable the simulator's
software keyboard; a hardware-keyboard accessory bar alone deliberately fails the
test. Forms are cancelled and editor changes stay in the isolated fixture.

For a standalone build with an embedded current-source bundle, Metro is not
required: generate the project with `create-project.rb` and run `xcodebuild test`
against the installed bundle. Retain the `.xcresult`, and identify the tested
source/bundle in the batch evidence. Do not count a browser capture as this test.

The generated test runner supports iPad and iPhone. `PhoneNoteSwipeTests` checks
that row drags reveal Favorite/Delete/Archive without opening the sidebar, that
full swipes toggle Favorite or archive without deleting, and that the archived
note remains reachable through navigation. These checks use a disposable fixture.

`TabletSourceScrollTests` checks the raw editor with fifty inserted lines:
the syntax layer must lay out the entire document and follow real input scrolling.
It also verifies formatting controls stay above the software keyboard through
rotation. Screenshots supplement numeric frame checks to catch clipped text.

`TabletCommandPaletteKeyboardTests` checks the palette's full bounds against the
software keyboard in both orientations, preserves its 540-point tablet width,
and types and selects a real navigation command after rotation. A continuous
result-list drag must scroll without executing a command or closing the keyboard.
Target existing
test IDs when asserting native labels; iOS may flatten intermediate view ancestry.

`TabletPortraitNavigationTests` verifies sidebar reveal by button and native
touch drag, section selection, header dismissal, and properties access. The
sidebar remains 260 points wide while the editor starts at x=340 and retains at
least 520 points, entirely inside the screen. `TabletPanelGestureTests` explicitly
sets landscape rather than depending on whichever orientation a prior test left.

`TabletVaultManagerTests` uses the installed app's isolated native vault copy.
It opens/closes the manager, rejects an invalid repository URL without contacting
a remote, and fails if credential restoration reports a Keychain access error.
The app (unlike the disposable test runner) must be built with normal simulator
signing enabled. `CODE_SIGNING_ALLOWED=NO` drops the simulator app identity and
can produce Keychain error -34018 even when all filesystem probes pass. Use
`CODE_SIGNING_ALLOWED=YES CODE_SIGN_IDENTITY=- ONLY_ACTIVE_ARCH=YES` with the
simulator destination. Let Xcode generate simulator identity entitlements; do not
copy those identities into production app configuration. The optional
`TOLARIA_QA` compilation flag is for local optimized probes only (ADR 0208).
