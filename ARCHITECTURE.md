# Architecture & Extension Points

## Overview

This VS Code extension provides a lightweight interface for applying Kubernetes and Kustomize manifests. The architecture is modular, making it easy to extend with new features.

## Core Modules

### 1. ManifestDetector (`src/utils/manifestDetector.ts`)

**Purpose**: Identifies Kubernetes manifests and Kustomization files

**Key Functions**:

- `analyzeDocument(document: TextDocument)` - Analyzes a document and returns detection results
- `isValidK8sResource(obj)` - Checks if an object is a valid K8s resource
- `isKustomizationResource(obj)` - Checks if an object is a Kustomization resource

**Usage**:

```typescript
import { ManifestDetector } from "./utils/manifestDetector";

const detection = ManifestDetector.analyzeDocument(document);
if (detection.isK8sManifest) {
  console.log("Found", detection.manifests.length, "Kubernetes resources");
}
```

### 2. CliExecutor (`src/utils/cliExecutor.ts`)

**Purpose**: Safely executes kubectl and kustomize commands

**Key Methods**:

- `applyManifest(filePath, options)` - Applies a manifest
- `validateManifest(filePath, options)` - Validates without applying
- `buildKustomize(dirPath, options)` - Builds Kustomization
- `applyKustomize(dirPath, options)` - Applies Kustomization
- `isKubectlAvailable()` - Checks if kubectl is installed
- `isKustomizeAvailable()` - Checks if kustomize is installed
- `getCurrentContext()` - Gets current kubectl context
- `listContexts()` - Lists available contexts

**Usage**:

```typescript
import { CliExecutor } from "./utils/cliExecutor";

const result = await CliExecutor.applyManifest("manifest.yaml", {
  context: "staging",
  namespace: "default",
  dryRun: true,
});

if (result.success) {
  console.log("Applied successfully");
} else {
  console.error("Error:", result.stderr);
}
```

### 3. ManifestCodeLensProvider (`src/providers/codeLensProvider.ts`)

**Purpose**: Provides inline code actions (buttons) in the editor

**Key Methods**:

- `provideCodeLenses(document, token)` - Returns code lens for a document

**Extension Points**:

- Add more code lens actions by creating new `CodeLens` objects
- Modify the regex to show buttons on different lines
- Add hover providers for additional info

### 4. Output Channel (`src/utils/outputChannel.ts`)

**Purpose**: Manages logging and user notifications

**Key Functions**:

- `log(message)` - Log to output channel
- `logError(message, error)` - Log error
- `show()` - Show output channel
- `showSuccess(message)` - Show success notification
- `showError(message)` - Show error notification
- `logCommandOutput(command, args, stdout, stderr, exitCode)` - Log command details

## Extension Points

### Adding New Commands

1. Define the command handler in `src/commands/manifestCommands.ts`:

```typescript
export async function myNewCommand(uri: vscode.Uri): Promise<void> {
  // Implementation
}
```

2. Register in `src/extension.ts`:

```typescript
context.subscriptions.push(
  vscode.commands.registerCommand(
    "k8s-manifest.myNewCommand",
    commands.myNewCommand,
  ),
);
```

3. Add to `package.json`:

```json
{
  "command": "k8s-manifest.myNewCommand",
  "title": "My New Command",
  "category": "Kubernetes"
}
```

### Adding New Context Menu Items

In `package.json`, add to `contributes.menus`:

```json
{
  "command": "k8s-manifest.myCommand",
  "when": "resourceExtname == .yaml",
  "group": "1_modification"
}
```

### Adding New Configuration Options

In `package.json`, add to `contributes.configuration.properties`:

```json
{
  "k8s-manifest.myOption": {
    "type": "boolean",
    "default": true,
    "description": "My option description"
  }
}
```

Then access in code:

```typescript
const config = vscode.workspace.getConfiguration("k8s-manifest");
const myOption = config.get<boolean>("myOption");
```

### Adding New Providers

Create a new provider class implementing the VS Code provider interface:

```typescript
export class MyProvider implements vscode.SomeProvider {
  provideSomething(document, token) {
    // Implementation
  }
}
```

Register in `src/extension.ts`:

```typescript
context.subscriptions.push(
  vscode.languages.registerSomeProvider({ language: "yaml" }, new MyProvider()),
);
```

## Data Flow

### Applying a Manifest

```
User clicks "Apply" button
    ↓
CodeLens command triggered
    ↓
manifestCommands.applyManifest()
    ↓
CliExecutor.applyManifest()
    ↓
execFile('kubectl', ['apply', '-f', filePath])
    ↓
Command result logged
    ↓
Success/error notification shown
```

### Detecting a Manifest

```
Document opened
    ↓
ManifestCodeLensProvider.provideCodeLenses()
    ↓
ManifestDetector.analyzeDocument()
    ↓
YAML parsed, K8s fields checked
    ↓
CodeLens created if valid manifest
    ↓
Buttons displayed in gutter
```

## Error Handling

The extension uses a consistent error handling pattern:

```typescript
try {
  // Operation
  output.log(`Starting operation...`);
  const result = await cliCommand();
  output.logCommandOutput(
    command,
    args,
    result.stdout,
    result.stderr,
    result.exitCode,
  );

  if (result.success) {
    await output.showSuccess("Operation succeeded");
  } else {
    await output.showErrorWithOutput(`Operation failed:\n${result.stderr}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  output.logError("Operation error", message);
  await output.showError(`Operation failed: ${message}`);
}
```

## Future Enhancement Ideas

1. **Inline Diagnostics**: Show validation errors as squiggly lines in the editor
2. **Autocomplete**: Suggest kubectl commands and K8s field names
3. **Diff Preview**: Show `--dry-run` output before applying
4. **Namespace Switching**: Quick switch between namespaces from the editor
5. **Resource Browser**: View deployed resources with real-time updates
6. **YAML Formatting**: Format and lint YAML files
7. **Multi-file Operations**: Apply multiple manifests at once
8. **Rollback Support**: Undo recent deployments
9. **Custom Commands**: Allow users to define custom kubectl commands
10. **Integration with Helm**: Support for Helm charts

## Testing

### Unit Tests

Create test files in `test/suite/`:

```typescript
suite("Feature Test", () => {
  test("should do something", () => {
    // Test implementation
  });
});
```

Run with: `npm test`

### Manual Testing Checklist

- [ ] Code Lens buttons appear on manifest files
- [ ] Apply command executes successfully
- [ ] Validate command runs without applying
- [ ] Error messages appear on invalid manifests
- [ ] Output channel shows command details
- [ ] Context menu items appear correctly
- [ ] Configuration options work as expected
- [ ] kubectl/kustomize availability check works

## Performance Considerations

1. **YAML Parsing**: Large manifests are parsed on every document open - consider caching for very large files
2. **CLI Execution**: kubectl operations can take time - consider timeout handling
3. **Code Lens**: Only shows on first manifest to avoid clutter - can be optimized for multi-document files
4. **File System**: Uses synchronous stat check - consider async version for workspace analysis

## Security

- CLI commands are executed with `execFile` (not `exec`) to avoid shell injection
- User input (file paths) comes from VS Code URI objects, not user text
- No external network calls except kubectl/kustomize CLI
- Credentials use existing kubectl configuration (no new credential handling)
