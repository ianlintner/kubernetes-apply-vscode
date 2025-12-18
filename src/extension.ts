import * as vscode from 'vscode';
import { ManifestCodeLensProvider } from './providers/codeLensProvider';
import * as commands from './commands/manifestCommands';
import { CliExecutor } from './utils/cliExecutor';
import * as output from './utils/outputChannel';

/**
 * Extension activation - called when extension is activated
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('Kubernetes Manifest Applier extension is now active');
  output.log('Kubernetes Manifest Applier activated');

  // Check if required CLI tools are available
  await checkRequiredTools();

  // Register Code Lens provider
  const codeLensProvider = new ManifestCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ language: 'yaml' }, codeLensProvider)
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('k8s-manifest.apply', commands.applyManifest),
    vscode.commands.registerCommand('k8s-manifest.validate', commands.validateManifest),
    vscode.commands.registerCommand('k8s-manifest.buildKustomize', commands.buildKustomize),
    vscode.commands.registerCommand('k8s-manifest.applyKustomize', commands.applyKustomize)
  );

  // Register configuration change listener to refresh Code Lens
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('k8s-manifest')) {
        output.log('Configuration changed');
      }
    })
  );

  output.log('Extension initialized successfully');
}

/**
 * Extension deactivation - called when extension is deactivated
 */
export function deactivate() {
  output.log('Kubernetes Manifest Applier deactivated');
  output.dispose();
}

/**
 * Checks if required CLI tools (kubectl) are available
 */
async function checkRequiredTools() {
  const kubectlAvailable = await CliExecutor.isKubectlAvailable();

  if (!kubectlAvailable) {
    const message =
      '⚠ kubectl not found. Please install kubectl to use this extension: https://kubernetes.io/docs/tasks/tools/';
    output.logError(message);
    await output.showWarning(message);
    return;
  }

  output.log('kubectl is available');

  // Check kustomize (optional)
  const kustomizeAvailable = await CliExecutor.isKustomizeAvailable();
  if (!kustomizeAvailable) {
    output.log('kustomize is not available (optional)');
  } else {
    output.log('kustomize is available');
  }

  // Log current kubectl context
  try {
    const currentContext = await CliExecutor.getCurrentContext();
    output.log(`Current kubectl context: ${currentContext}`);
  } catch (error) {
    output.logError('Could not determine current kubectl context', error instanceof Error ? error.message : String(error));
  }
}
