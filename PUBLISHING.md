# Publishing to the VS Code Marketplace

This repo is already set up to publish via GitHub Actions when you push a version tag like `v0.0.2`.

## One-time Marketplace setup

1. **Create / verify a publisher**
   - Go to the Visual Studio Marketplace publisher management page:
   <https://marketplace.visualstudio.com/manage>
   - Create a publisher **with the exact ID in** `package.json`:
     - `publisher`: `k8smanifest`

   If you want a different publisher ID (e.g. `ianlintner`), change `package.json -> publisher` to match the publisher you create.

2. **Create a Marketplace PAT (publish token)**
   - Create an Azure DevOps Personal Access Token (PAT) with the Marketplace publish scope.
   - The simplest place to start is:
   <https://dev.azure.com>
     then **User settings → Personal access tokens**.

   Notes:
   - Make sure the token can publish to the Marketplace.
   - Keep the token somewhere safe; you’ll only see it once.

3. **Add the token to GitHub Secrets (repo-level)**
   - In your GitHub repo: **Settings → Secrets and variables → Actions**
   - Add a secret:
     - Name: `VSCE_PAT`
     - Value: your Marketplace PAT

## Release process

1. Bump the version in `package.json` (and commit it).
2. Create and push a tag that matches the version:
   - Example: `package.json` version is `0.0.2` → tag must be `v0.0.2`
3. Pushing the tag triggers `.github/workflows/publish.yml` to:
   - install deps
   - verify tag == version
   - compile
   - package the `.vsix`
   - publish to the Marketplace

## Safe dry-run in GitHub Actions

The workflow supports a manual run that **packages only** (no publish) by default:

- GitHub → Actions → **Publish Extension** → Run workflow
- Leave `publish` unchecked to do a safe build/package validation.

If you check `publish`, it will publish using the repo secret `VSCE_PAT`.

## Manual publishing (local)

If you prefer to publish from your machine:

- `npm run package`
- `npm run publish`

You’ll be prompted for authentication unless you pass a PAT.

## Troubleshooting

- **“Invalid publisher”**: `package.json` `publisher` does not exist in Marketplace, or you’re logged into the wrong account.
- **“Version already exists”**: bump `package.json` version and re-tag.
- **Tag/version mismatch**: the workflow requires `vX.Y.Z` tag to match `package.json` `version` exactly.
