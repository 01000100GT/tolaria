# Linked Folder Write-Back: October 13, 2026

## Scope and gates

- User requested local folder write-back for iCloud and installation on the
  paired physical iPad. Work stays on `mobile-ui-foundation`.
- Starting project CodeScene: Hotspot 10.0, Average 9.991507140267476;
  floors 10.0 / 9.99. Exact per-file baselines and scan manifests are retained
  in `/Volumes/Jupiter/Cache/tolaria-icloud-folder-20261013`.
- The existing owner-approved mobile workspace/Git/settings analyzer exception
  in `ipad-review-2026-10-11.md` remains in force until October 14, 14:12 UTC.
  Codacy Cloud tool listing failed twice again with `No API token found`;
  CodeScene MCP tools remain absent. Cloud parity and exact-SHA results are
  unavailable, not zero. This batch is not production promotion.
- Compensating checks: per-file local Codacy and CodeScene before/after, native
  Foundation tests, scoped mobile checks and simulator interaction. Physical
  signing/install is blocked on the owner's macOS keychain approval.
  One interrupted Trivy DB update produced a partial result; it is not
  counted as clean. Its complete retry passed all three relevant Swift analyzers.

## Acceptance

- New iOS Files selections link to their original folder; old copies stay local.
- Local saves, incoming edits, binary attachments, rename/deletion, relaunch,
  unavailable folder and concurrent-edit preservation receive focused tests.
- User vaults are never test fixtures. QA uses disposable directories and restores
  the prior simulator catalog. Physical install updates in place, no uninstall.
- Distinguish Files-provider persistence from actual cross-device iCloud delivery.

## Release record

- Implemented coordinated two-way reconciliation, persisted folder grants,
  foreground automatic/manual sync, conservative conflicts, and truthful
  "Saved to folder" status. Existing imported copies are not silently linked.
- Added a red/green regression for `.note.md.icloud` placeholders: they must
  not delete the cached note, copy placeholder metadata, or advance the baseline.
  Undownloaded ubiquitous items request download and abort the current pass;
  retry after the provider makes the content available. Read/coordination errors
  also stop reconciliation. This is not a background iCloud delivery guarantee.
- Native QA used computer-use interaction on the Release iPad simulator, not
  Safari: Files picker -> disposable folder -> native source edit -> automatic
  write-back. The original provider file retained the complete frontmatter.
  An external edit appeared after manual sync. A further external edit appeared
  automatically after relaunch and installation of the final Release build,
  demonstrating that the persisted bookmark survived container relocation.
  Evidence: `native-write-back-proof.md`, `native-final-proof.md`,
  `native-incoming-sync.png`, and `native-final-relaunch.png` in the evidence root.
- The attempted XCTest Files-picker driver did not pass; its selectors matched
  background app elements. It is preserved as a WIP outside the repository,
  not committed or counted as passing. The computer-use path above succeeded.
- Tests: `pnpm mobile:lint`, `pnpm mobile:typecheck`, `pnpm mobile:test` pass
  (1,427 tests / 245 files), as does the mobile web export in the normal push
  hook. Native `swift test --package-path apps/mobile/modules/tolaria-workspace-access`
  passes 72 tests after the placeholder regression. The final simulator ARM64
  Release build succeeds. Desktop/Rust coverage and broad suites were not run,
  following the mobile-only experimental workflow; this is not release promotion.
- CodeScene: all 23 committed code paths are 10.0 or unscorable with no warnings;
  existing 10.0 scores remain 10.0. The placeholder follow-up preserves 10.0 in
  both touched Swift files. CLI staged delta passes; unavailable MCP safeguard
  and main-based promotion checks are not represented as passing. Project
  Hotspot 10.0 / Average 9.991507140267476 pass floors 10.0 / 9.99 at first push.
- Codacy: exact branch inventory is `branch-manifest-final.txt`; this batch's
  classified 23-code-path inventory is `committed-code-manifest.json`. Every
  applicable local analyzer completed per file, with zero issues and errors at
  every severity. Existing zero baselines stayed zero and new files are zero.
  Swift uses Opengrep 1.26.0, Trivy 0.72.0, Lizard 1.23.0; TypeScript additionally
  uses Biome 2.5.6 and ESLint9 9.39.5. Per-file JSON includes exact tool/file rows.
  Cloud baselines, analyzer parity and exact-SHA dashboard checks remain
  unavailable under the time-bounded exception above, not zero or release-ready.
- Localization: shared English keys, Lara translation and validation pass for
  all 21 catalogs / 1,224 keys. Existing Belarusian Latin catalog was updated
  consistently; the placeholder follow-up changes no UI copy.
- PostHog: `mobile_folder_sync_requested` records manual discovery/use without
  vault names, paths, bookmarks, or content. Automatic poll events are omitted
  to avoid noise. No new event is needed for the placeholder safety correction.
- Refactoring: shared file metadata lookup keeps the safety check at CodeScene
  10.0. ADR 0217, ARCHITECTURE and ABSTRACTIONS document the storage integration.
- Hygiene: disposable source/cache/link-state files were removed and the
  simulator catalog restored byte-for-byte. SHA-256 checks confirm all 6,036
  existing Laputa files unchanged with no additions or removals. Host Laputa
  was not touched. `git status --short -- demo-vault demo-vault-v2` is empty.
- Commit `755d93b99` passed normal hooks and was pushed to
  `origin/mobile-ui-foundation`. The follow-up uses the same verified branch
  workflow. Physical iPad installation remains incomplete: `codesign` waits
  for Apple Development key access in macOS SecurityAgent. No device uninstall,
  data reset, security bypass, or claim of physical iCloud end-to-end QA.
