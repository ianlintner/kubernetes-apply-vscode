# Changelog

## [2026-W17] — 2026-04-26

- Upgrade caretaker from v0.5.2 to v0.10.0; refresh workflow and agent templates; fix pip install for renamed `caretaker-github` package (#12)
- Fix workflow dispatch: rename `upgrade-only` mode to `upgrade` to match caretaker's `RunMode` enum, preventing CLI invalid-enum errors on manual dispatch (#13)
- Bump caretaker to v0.12.0; enable fleet-registry heartbeat reporting with OAuth2 `client_credentials` auth; add triage block in dry-run mode (#18)

## 0.0.1

- Initial release
  - Apply/validate Kubernetes YAML manifests
  - Build/apply `kustomization.yaml`
  - CodeLens and context menu actions
