# Usage

## Apply or validate a manifest

1. Open a Kubernetes YAML manifest in VS Code.
2. Use the Code Lens buttons above the `apiVersion` line:
   - **▶ Apply** – runs `kubectl apply -f <file>`
   - **✓ Validate** – runs `kubectl apply --dry-run=client -f <file>`
3. Review results in the **Kubernetes Manifest Applier** output channel.

## Context menu actions

- **Editor**: Right-click a manifest file → **Apply Manifest** or **Validate Manifest**.
- **Explorer**: Right-click a YAML manifest → **Apply Manifest**.
- **Explorer (Kustomize)**: Right-click `kustomization.yaml` → **Build with Kustomize** or **Apply Kustomize**.

## Command Palette

Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) and run:

- `Kubernetes: Apply Manifest`
- `Kubernetes: Validate Manifest`
- `Kubernetes: Build with Kustomize`
- `Kubernetes: Apply Kustomize`

## Configuration options

Configure via **Settings ➜ Extensions ➜ Kubernetes Manifest Applier** or `settings.json`:

```json
{
  "k8s-manifest.enableCodeLens": true,
  "k8s-manifest.kubectlContext": "",
  "k8s-manifest.kubectlNamespace": "",
  "k8s-manifest.dryRun": false,
  "k8s-manifest.useKubernetesExtension": false
}
```

### VSCode Kubernetes Extension Integration

When `k8s-manifest.useKubernetesExtension` is enabled, this extension will automatically use the context and namespace from the [VSCode Kubernetes Extension](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools) if it's installed. This allows you to:

- Use the same context/namespace shown in the Kubernetes extension's explorer
- Avoid manually configuring context and namespace in multiple places
- Automatically sync with context/namespace changes made in the Kubernetes extension

**Note**: Manual settings (`k8s-manifest.kubectlContext` and `k8s-manifest.kubectlNamespace`) take precedence over values from the Kubernetes extension.

## Output and logging

- All command output is routed to the **Kubernetes Manifest Applier** output channel.
- Success and error notifications include a quick link to open the channel.

## Sample workflows

- **Validate before applying**: enable `k8s-manifest.dryRun` or click **✓ Validate** first.
- **Work in a specific namespace**: set `k8s-manifest.kubectlNamespace` in Settings.
- **Apply a kustomization**: right-click the folder containing `kustomization.yaml` → **Apply Kustomize**.
- **Integrate with Kubernetes extension**: enable `k8s-manifest.useKubernetesExtension` to automatically use the context and namespace from the VSCode Kubernetes Extension.
