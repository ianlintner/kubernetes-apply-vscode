# FAQ & Troubleshooting

## Code Lens buttons are not showing
- Confirm the file is detected as YAML (status bar should say "YAML").
- Ensure `k8s-manifest.enableCodeLens` is `true` in settings.
- The file must contain valid Kubernetes fields (`apiVersion`, `kind`, `metadata`).

## `kubectl` not found
- Verify installation: `kubectl version --client`.
- Ensure `kubectl` is on your `PATH` in the environment VS Code uses.

## Commands fail with context/namespace issues
- Set `k8s-manifest.kubectlContext` or `k8s-manifest.kubectlNamespace` in Settings.
- Check your current context: `kubectl config current-context`.

## Kustomize actions fail
- Install `kustomize` if you plan to use build/apply for kustomizations.

## Where do logs go?
- Open the **Kubernetes Manifest Applier** output channel (View → Output, then select the channel).

## How do I package the extension?
- Run `vsce package` after `npm run compile`.
- Install the `.vsix` in VS Code via **Extensions ➜ … ➜ Install from VSIX…**.
