# Kubernetes Manifest Applier

Apply Kubernetes and Kustomize manifests directly from the VS Code editor with one-click actions.

## Features

- **Code Lens Actions**: Show "▶ Apply" and "✓ Validate" buttons directly in the YAML editor
- **Right-Click Context Menu**: Apply, validate, and build manifests from the explorer or editor
- **Manifest Detection**: Automatically detects Kubernetes manifests and Kustomization files
- **Multi-Document Support**: Handle YAML files with multiple Kubernetes resources (separated by `---`)
- **Dry Run Mode**: Validate changes without applying them
- **Context & Namespace Selection**: Configure kubectl context and namespace in settings
- **Output Channel**: Detailed command logs and error messages
- **Kustomize Support**: Build and apply Kustomization directories

## Requirements

- **kubectl**: Required for applying and validating manifests
- **kustomize**: Optional, required only if using Kustomization features

Install kubectl: https://kubernetes.io/docs/tasks/tools/

Install kustomize: https://kubectl.docs.kubernetes.io/installation/kustomize/

## Usage

### Via Code Lens (Gutter Buttons)

When you open a Kubernetes manifest file in the editor:
1. Look for "▶ Apply" and "✓ Validate" buttons above the `apiVersion` line
2. Click the button to execute the command
3. View results in the "Kubernetes Manifest Applier" output channel

### Via Right-Click Context Menu

**In the editor:**
- Right-click on a YAML file with a manifest
- Select "Apply Manifest" or "Validate Manifest"

**In the explorer:**
- Right-click on a manifest file → "Apply Manifest"
- Right-click on a `kustomization.yaml` file → "Build with Kustomize" or "Apply Kustomize"

### Via Command Palette

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) and search for:
- `Kubernetes: Apply Manifest`
- `Kubernetes: Validate Manifest`
- `Kubernetes: Build with Kustomize`
- `Kubernetes: Apply Kustomize`

## Configuration

Open VS Code Settings and search for "k8s-manifest":

- **Enable Code Lens** (`k8s-manifest.enableCodeLens`): Toggle gutter buttons (default: `true`)
- **kubectl Context** (`k8s-manifest.kubectlContext`): Specify kubectl context (default: empty = current context)
- **kubectl Namespace** (`k8s-manifest.kubectlNamespace`): Specify namespace (default: empty = default namespace)
- **Dry Run** (`k8s-manifest.dryRun`): Run apply commands with `--dry-run=client` (default: `false`)

## Supported Manifest Types

This extension automatically detects:
- Kubernetes resources (Deployment, Service, ConfigMap, Pod, etc.)
- Kustomization files (`kustomization.yaml`)
- Multi-document YAML files

## Output

All command output is displayed in the "Kubernetes Manifest Applier" output channel:
- View the channel via the "View Output" button in notifications
- Or open it manually via the Output panel (View → Output)

## Known Limitations

- Requires `kubectl` to be installed and accessible in your PATH
- `kustomize` is optional but required for Kustomization features
- Cannot authenticate with kubectl clusters via the extension (uses existing kubeconfig)
- No support for CRD validation (uses kubectl's built-in validation)

## License

MIT
