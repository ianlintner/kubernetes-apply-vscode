import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | null = null;

/**
 * Initialize or get the extension output channel
 */
export function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('Kubernetes Manifest Applier');
  }
  return outputChannel;
}

/**
 * Log a message to the output channel
 */
export function log(message: string): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toLocaleTimeString();
  channel.appendLine(`[${timestamp}] ${message}`);
}

/**
 * Log an error to the output channel
 */
export function logError(message: string, error?: Error | string): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toLocaleTimeString();
  channel.appendLine(`[${timestamp}] ERROR: ${message}`);
  if (error) {
    const errorStr = typeof error === 'string' ? error : error.message;
    channel.appendLine(errorStr);
  }
}

/**
 * Clear the output channel
 */
export function clear(): void {
  getOutputChannel().clear();
}

/**
 * Show the output channel
 */
export function show(): void {
  getOutputChannel().show(true);
}

/**
 * Dispose the output channel
 */
export function dispose(): void {
  if (outputChannel) {
    outputChannel.dispose();
    outputChannel = null;
  }
}

/**
 * Show an information notification
 */
export async function showInfo(message: string): Promise<void> {
  await vscode.window.showInformationMessage(message);
}

/**
 * Show a warning notification
 */
export async function showWarning(message: string): Promise<void> {
  await vscode.window.showWarningMessage(message);
}

/**
 * Show an error notification
 */
export async function showError(message: string): Promise<void> {
  await vscode.window.showErrorMessage(message);
}

/**
 * Show success notification with option to view output
 */
export async function showSuccess(message: string): Promise<void> {
  const result = await vscode.window.showInformationMessage(message, 'View Output');
  if (result === 'View Output') {
    show();
  }
}

/**
 * Show error notification with option to view output
 */
export async function showErrorWithOutput(message: string): Promise<void> {
  const result = await vscode.window.showErrorMessage(message, 'View Output');
  if (result === 'View Output') {
    show();
  }
}

/**
 * Show command output in output channel
 */
export function logCommandOutput(
  command: string,
  args: string[],
  stdout: string,
  stderr: string,
  exitCode: number
): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toLocaleTimeString();

  channel.appendLine(`\n${'='.repeat(60)}`);
  channel.appendLine(`[${timestamp}] Command: ${command} ${args.join(' ')}`);
  channel.appendLine(`Exit Code: ${exitCode}`);

  if (stdout) {
    channel.appendLine('\n--- STDOUT ---');
    channel.appendLine(stdout);
  }

  if (stderr) {
    channel.appendLine('\n--- STDERR ---');
    channel.appendLine(stderr);
  }

  channel.appendLine(`${'='.repeat(60)}\n`);
}
