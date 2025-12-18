# Quick Start Guide

## Setup & Development

### Prerequisites
- Node.js 16+ and npm
- TypeScript (installed via npm)
- VS Code 1.85.0 or later

### Installation

1. Install dependencies:
```bash
npm install
```

2. Compile TypeScript:
```bash
npm run compile
```

3. Watch mode (for development):
```bash
npm run watch
```

## Testing the Extension

### Option 1: Debug Mode (Recommended)

1. Open the project in VS Code
2. Press `F5` to launch the extension in a debug window
3. A new VS Code window opens with the extension loaded

### Option 2: Manual Testing

1. Run `npm run compile`
2. Run `vsce package` to create a .vsix file
3. In VS Code, open the Extensions sidebar
4. Click "Install from VSIX..." and select the .vsix file

## Test with Sample Files

### Test Manifest Apply

1. Open `example-manifest.yaml` in the debug VS Code window
2. You should see "▶ Apply" and "✓ Validate" buttons above the `apiVersion` line
3. Click either button to execute the command
4. View output in the "Kubernetes Manifest Applier" output channel

### Test Kustomization

1. Right-click on `example-kustomization/kustomization.yaml` in the explorer
2. Select "Build with Kustomize" or "Apply Kustomize"
3. View results in the output channel

## Project Structure

```
src/
├── extension.ts              # Entry point
├── commands/
│   └── manifestCommands.ts   # Command implementations
├── providers/
│   └── codeLensProvider.ts   # Code Lens implementation
└── utils/
    ├── manifestDetector.ts   # YAML parsing & detection
    ├── cliExecutor.ts        # kubectl/kustomize CLI wrapper
    └── outputChannel.ts      # Logging & notifications
```

## Useful npm Scripts

```bash
# Compile TypeScript to JavaScript
npm run compile

# Watch TypeScript files and auto-compile
npm run watch

# Run linter
npm run lint

# Run tests
npm test

# Create extension package (.vsix)
vsce package
```

## Debugging

- Set breakpoints in VS Code and they will be hit in the debug window
- Use `console.log()` for debugging (logs appear in the debug console)
- Use `output.log()` for user-facing logs (appear in output channel)

## Extension Configuration

Settings available in VS Code Settings (Cmd+, on Mac):

```json
{
  "k8s-manifest.enableCodeLens": true,
  "k8s-manifest.kubectlContext": "",
  "k8s-manifest.kubectlNamespace": "",
  "k8s-manifest.dryRun": false
}
```

## Troubleshooting

### "kubectl not found" warning
- Ensure kubectl is installed: `kubectl version --client`
- Add kubectl to your PATH if needed

### Code Lens not showing
- Check that `k8s-manifest.enableCodeLens` is `true` in settings
- Verify the file is detected as a YAML file (bottom right corner should show "YAML")
- Ensure file contains valid Kubernetes manifest fields

### Commands not working
- Open the output channel to view error details
- Check that kubectl is available: `which kubectl`
- Verify kubectl is configured: `kubectl config current-context`

## Publishing

When ready to publish to VS Code Marketplace:

1. Install vsce: `npm install -g @vscode/vsce`
2. Package: `vsce package`
3. Login: `vsce login <publisher-name>`
4. Publish: `vsce publish`

See [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) for details.
