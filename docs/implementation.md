# Implementation Notes

## Project layout

```
src/
├── extension.ts              # Activation/deactivation and registrations
├── commands/
│   └── manifestCommands.ts   # Apply/validate/build/apply-kustomize handlers
├── providers/
│   └── codeLensProvider.ts   # Code Lens for gutter buttons
└── utils/
    ├── manifestDetector.ts   # YAML parsing & detection logic
    ├── cliExecutor.ts        # kubectl/kustomize execution helpers
    └── outputChannel.ts      # Logging & notifications

test/
├── runTest.ts                # Test runner
└── suite/index.ts            # Basic test cases
```

## Build and tooling

- TypeScript + ESLint (`npm run lint`).
- Tests run with `@vscode/test-electron` (`npm test`).
- Prepublish hook (`npm run compile`) builds to `out/`.

## Activation & commands

- Activates on `onLanguage:yaml` and when the workspace contains `kustomization.yaml`.
- Exposes commands `k8s-manifest.apply`, `k8s-manifest.validate`, `k8s-manifest.buildKustomize`, and `k8s-manifest.applyKustomize`.
- Context menu items are available in editors and explorer for YAML/kustomization files.

## Error handling

- CLI operations are wrapped in try/catch with logging to the output channel.
- Command output (stdout, stderr, exit codes) is logged for traceability.
- Notifications surface success/failure and link to the output channel.

## Known limitations

- Requires `kubectl` on PATH; `kustomize` is optional but needed for related commands.
- No CRD schema validation.
- Multi-document YAML shows Code Lens on the first manifest only.
