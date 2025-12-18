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
  "k8s-manifest.dryRun": false
}
```

## Output and logging

- All command output is routed to the **Kubernetes Manifest Applier** output channel.
- Success and error notifications include a quick link to open the channel.

## Sample workflows

- **Validate before applying**: enable `k8s-manifest.dryRun` or click **✓ Validate** first.
- **Work in a specific namespace**: set `k8s-manifest.kubectlNamespace` in Settings.
- **Apply a kustomization**: right-click the folder containing `kustomization.yaml` → **Apply Kustomize**.
