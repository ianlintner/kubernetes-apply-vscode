import * as vscode from 'vscode';
import * as path from 'path';
import { CliExecutor } from '../utils/cliExecutor';
import * as output from '../utils/outputChannel';
import * as fs from 'fs';
import { KubernetesExtension } from '../utils/kubernetesExtension';

/**
 * Gets configuration values for kubectl execution
 */
async function getKubectlConfig() {
  const config = vscode.workspace.getConfiguration('k8s-manifest');
  const useK8sExtension = config.get<boolean>('useKubernetesExtension') || false;

  let context = config.get<string>('kubectlContext') || undefined;
  let namespace = config.get<string>('kubectlNamespace') || undefined;

  // If Kubernetes extension integration is enabled, try to get context/namespace from it
  if (useK8sExtension) {
    try {
      const isAvailable = await KubernetesExtension.isAvailable();
      if (isAvailable) {
        const k8sContext = await KubernetesExtension.getCurrentContext();

        // Use Kubernetes extension context if available and not overridden by setting
        if (k8sContext.context && !context) {
          context = k8sContext.context;
          output.log(`Using context from Kubernetes extension: ${context}`);
        }

        // Use Kubernetes extension namespace if available and not overridden by setting
        if (k8sContext.namespace && !namespace) {
          namespace = k8sContext.namespace;
          output.log(`Using namespace from Kubernetes extension: ${namespace}`);
        }
      } else {
        output.log('Kubernetes extension is not available, using configuration settings');
      }
    } catch (error) {
      output.logError(
        'Error getting context from Kubernetes extension',
        error instanceof Error ? error.message : String(error),
      );
      output.log('Falling back to configuration settings');
    }
  }

  return {
    context,
    namespace,
    dryRun: config.get<boolean>('dryRun') || false,
  };
}

/**
 * Command: Apply a Kubernetes manifest
 */
export async function applyManifest(uri: vscode.Uri): Promise<void> {
  try {
    const filePath = uri ? uri.fsPath : vscode.window.activeTextEditor?.document.fileName;

    if (!filePath) {
      await output.showError('No file selected');
      return;
    }

    output.log(`Applying manifest: ${filePath}`);
    output.show();

    const config = await getKubectlConfig();
    const result = await CliExecutor.applyManifest(filePath, {
      context: config.context,
      namespace: config.namespace,
      dryRun: config.dryRun,
      cwd: path.dirname(filePath),
    });

    output.logCommandOutput(
      'kubectl',
      ['apply', '-f', path.basename(filePath)],
      result.stdout,
      result.stderr,
      result.exitCode,
    );

    if (result.success) {
      await output.showSuccess(`✓ Manifest applied successfully`);
    } else {
      await output.showErrorWithOutput(`✗ Failed to apply manifest:\n${result.stderr}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.logError('Error applying manifest', message);
    await output.showError(`Failed to apply manifest: ${message}`);
  }
}

/**
 * Command: Validate a Kubernetes manifest
 */
export async function validateManifest(uri: vscode.Uri): Promise<void> {
  try {
    const filePath = uri ? uri.fsPath : vscode.window.activeTextEditor?.document.fileName;

    if (!filePath) {
      await output.showError('No file selected');
      return;
    }

    output.log(`Validating manifest: ${filePath}`);
    output.show();

    const config = await getKubectlConfig();
    const result = await CliExecutor.validateManifest(filePath, {
      context: config.context,
      namespace: config.namespace,
      cwd: path.dirname(filePath),
    });

    output.logCommandOutput(
      'kubectl',
      ['apply', '-f', path.basename(filePath), '--dry-run=client', '--validate=true'],
      result.stdout,
      result.stderr,
      result.exitCode,
    );

    if (result.success) {
      await output.showSuccess(`✓ Manifest is valid`);
    } else {
      await output.showErrorWithOutput(`✗ Manifest validation failed:\n${result.stderr}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.logError('Error validating manifest', message);
    await output.showError(`Failed to validate manifest: ${message}`);
  }
}

/**
 * Command: Build a Kustomization directory
 */
export async function buildKustomize(uri: vscode.Uri): Promise<void> {
  try {
    let dirPath = uri?.fsPath;

    // If it's a file, use its directory
    if (dirPath && !fs.statSync(dirPath).isDirectory()) {
      dirPath = path.dirname(dirPath);
    }

    if (!dirPath) {
      await output.showError('No directory selected');
      return;
    }

    output.log(`Building Kustomization: ${dirPath}`);
    output.show();

    const result = await CliExecutor.buildKustomize(dirPath, {
      cwd: dirPath,
    });

    output.logCommandOutput(
      'kustomize',
      ['build', dirPath],
      result.stdout,
      result.stderr,
      result.exitCode,
    );

    if (result.success) {
      await output.showSuccess(`✓ Kustomization built successfully`);
    } else {
      await output.showErrorWithOutput(`✗ Failed to build Kustomization:\n${result.stderr}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.logError('Error building Kustomization', message);
    await output.showError(`Failed to build Kustomization: ${message}`);
  }
}

/**
 * Command: Apply a Kustomization directory
 */
export async function applyKustomize(uri: vscode.Uri): Promise<void> {
  try {
    let dirPath = uri?.fsPath;

    // If it's a file, use its directory
    if (dirPath && !fs.statSync(dirPath).isDirectory()) {
      dirPath = path.dirname(dirPath);
    }

    if (!dirPath) {
      await output.showError('No directory selected');
      return;
    }

    output.log(`Applying Kustomization: ${dirPath}`);
    output.show();

    const config = await getKubectlConfig();
    const result = await CliExecutor.applyKustomize(dirPath, {
      context: config.context,
      namespace: config.namespace,
      dryRun: config.dryRun,
      cwd: dirPath,
    });

    output.logCommandOutput(
      'kubectl',
      ['apply', '-k', dirPath],
      result.stdout,
      result.stderr,
      result.exitCode,
    );

    if (result.success) {
      await output.showSuccess(`✓ Kustomization applied successfully`);
    } else {
      await output.showErrorWithOutput(`✗ Failed to apply Kustomization:\n${result.stderr}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.logError('Error applying Kustomization', message);
    await output.showError(`Failed to apply Kustomization: ${message}`);
  }
}
