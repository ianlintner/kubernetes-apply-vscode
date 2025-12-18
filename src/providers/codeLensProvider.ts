import * as vscode from 'vscode';
import { ManifestDetector } from '../utils/manifestDetector';

/**
 * Provides code lens actions for Kubernetes manifests
 * Shows "▶ Apply" and "✓ Validate" buttons above apiVersion line
 */
export class ManifestCodeLensProvider implements vscode.CodeLensProvider {
  private codeLensRegex = /^\s*(apiVersion):/gm;

  onDidChangeCodeLenses?: vscode.Event<void> | undefined;

  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    // Check if Code Lens is enabled
    const config = vscode.workspace.getConfiguration('k8s-manifest');
    if (!config.get<boolean>('enableCodeLens', true)) {
      return [];
    }

    // Check if this is a YAML file
    if (document.languageId !== 'yaml') {
      return [];
    }

    // Detect if it's a Kubernetes manifest
    const detection = ManifestDetector.analyzeDocument(document);
    if (!detection.isK8sManifest && !detection.isKustomization) {
      return [];
    }

    const codeLenses: vscode.CodeLens[] = [];
    const text = document.getText();
    let match;

    while ((match = this.codeLensRegex.exec(text)) !== null) {
      const line = document.positionAt(match.index).line;
      const range = new vscode.Range(line, 0, line, 0);

      // Apply command
      codeLenses.push(
        new vscode.CodeLens(range, {
          title: '▶ Apply',
          command: 'k8s-manifest.apply',
          arguments: [document.uri],
          tooltip: 'Apply manifest with kubectl',
        })
      );

      // Validate command
      codeLenses.push(
        new vscode.CodeLens(range, {
          title: '✓ Validate',
          command: 'k8s-manifest.validate',
          arguments: [document.uri],
          tooltip: 'Validate manifest without applying',
        })
      );

      // Only show on first manifest (first apiVersion line)
      break;
    }

    return codeLenses;
  }

  resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
    return codeLens;
  }
}
