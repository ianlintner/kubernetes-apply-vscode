# Getting Started

Follow these steps to set up the extension for local development and debugging.

## Prerequisites

- Node.js 16+ and npm
- VS Code 1.85.0 or later
- `kubectl` installed and on your `PATH`
- `kustomize` installed if you plan to use Kustomization features

## Install and build

1. Install dependencies:
   ```bash
   npm install
   ```
2. Compile TypeScript:
   ```bash
   npm run compile
   ```
3. (Optional) Watch for changes during development:
   ```bash
   npm run watch
   ```

## Run the tests

```bash
npm test
```

> `npm test` runs `npm run compile` and `npm run lint` automatically via the `pretest` script.

## Debug in VS Code (recommended)

1. Open the project in VS Code.
2. Press **F5** to launch the extension in a new Extension Development Host window.
3. Open a Kubernetes manifest (for example `example-manifest.yaml`) and use the gutter buttons.

## Manual packaging (optional)

You can package the extension as a VSIX when you are ready to distribute:

```bash
npm install -g @vscode/vsce
vsce package
```

Install the resulting `.vsix` in VS Code via **Extensions ➜ … ➜ Install from VSIX…**.
