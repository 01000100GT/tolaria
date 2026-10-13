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
  Foundation tests, scoped mobile checks, simulator interaction, signed physical
  install. One interrupted Trivy DB update produced a partial result; it is not
  counted as clean. Its complete retry passed all three relevant Swift analyzers.

## Acceptance

- New iOS Files selections link to their original folder; old copies stay local.
- Local saves, incoming edits, binary attachments, rename/deletion, relaunch,
  unavailable folder and concurrent-edit preservation receive focused tests.
- User vaults are never test fixtures. QA uses disposable directories and restores
  the prior simulator catalog. Physical install updates in place, no uninstall.
- Distinguish Files-provider persistence from actual cross-device iCloud delivery.

## Release record

Pending final verification, native installation and verified branch push.
