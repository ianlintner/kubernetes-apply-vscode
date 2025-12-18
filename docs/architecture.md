# Architecture & Extension Points

The extension is modular and focused on safe CLI execution plus lightweight manifest detection.

## Core modules

### ManifestDetector (`src/utils/manifestDetector.ts`)

- Parses YAML (multi-document supported) using `js-yaml`.
- Checks for `apiVersion`, `kind`, `metadata` to confirm Kubernetes resources.
- Detects kustomization resources and `kustomization.yaml` files.

### CliExecutor (`src/utils/cliExecutor.ts`)

- Wraps `kubectl` and `kustomize` via `execFile` for safety.
- Commands: `applyManifest`, `validateManifest`, `buildKustomize`, `applyKustomize`.
- Includes availability checks, context/namespace options, and dry-run support.

### ManifestCodeLensProvider (`src/providers/codeLensProvider.ts`)

- Provides Code Lens buttons in YAML editors when manifests are detected.

### Output Channel (`src/utils/outputChannel.ts`)

- Dedicated output channel with helpers for success/error messages and command logging.

## Data flow (apply manifest)

```
User click
  → CodeLens command
  → manifestCommands.applyManifest
  → CliExecutor.applyManifest
  → kubectl apply -f <file>
  → Log output + notification
```

## Extension points

- **New commands**: add a handler in `manifestCommands.ts`, register in `extension.ts`, and expose via `package.json`.
- **Additional menu entries**: extend `contributes.menus` in `package.json`.
- **New settings**: add to `contributes.configuration` and read with `workspace.getConfiguration('k8s-manifest')`.
- **Providers**: register additional VS Code providers (hover, diagnostics, etc.) in `extension.ts`.

## Performance & security notes

- YAML parsing runs on document open; for very large files consider caching if you extend the code.
- CLI calls use `execFile` (not `exec`) to avoid shell injection.
- Credentials are handled by the existing `kubectl` configuration—no new secret handling in the extension.
