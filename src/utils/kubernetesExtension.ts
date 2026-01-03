import * as k8s from 'vscode-kubernetes-tools-api';
import * as output from './outputChannel';

/**
 * Interface for Kubernetes context information from the extension
 */
export interface K8sExtensionContext {
  context?: string;
  namespace?: string;
}

/**
 * Utility class to interact with the VSCode Kubernetes Extension
 */
export class KubernetesExtension {
  /**
   * Check if the Kubernetes extension is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const kubectl = await k8s.extension.kubectl.v1;
      return kubectl.available;
    } catch (error) {
      output.logError(
        'Error checking Kubernetes extension availability',
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  /**
   * Get the current context and namespace from the Kubernetes extension
   */
  static async getCurrentContext(): Promise<K8sExtensionContext> {
    const result: K8sExtensionContext = {};

    try {
      const kubectl = await k8s.extension.kubectl.v1;

      if (!kubectl.available) {
        output.log('Kubernetes extension kubectl API is not available');
        return result;
      }

      // Get current context
      const contextResult = await kubectl.api.invokeCommand(
        'config current-context',
      );
      if (contextResult && contextResult.code === 0) {
        const contextName = contextResult.stdout.trim();
        if (contextName) {
          result.context = contextName;
          output.log(`Retrieved context from Kubernetes extension: ${contextName}`);
        }
      } else {
        output.logError(
          'Failed to get context from Kubernetes extension',
          contextResult ? contextResult.stderr : 'unknown error',
        );
      }

      // Get current namespace from the active context
      const namespaceResult = await kubectl.api.invokeCommand(
        "config view --minify --output 'jsonpath={.contexts[0].context.namespace}'",
      );
      if (namespaceResult && namespaceResult.code === 0) {
        const namespace = namespaceResult.stdout.trim();
        // If namespace is empty, kubectl uses 'default'
        if (namespace) {
          result.namespace = namespace;
          output.log(`Retrieved namespace from Kubernetes extension: ${namespace}`);
        } else {
          output.log('No namespace in context, will use default');
        }
      } else {
        output.logError(
          'Failed to get namespace from Kubernetes extension',
          namespaceResult ? namespaceResult.stderr : 'unknown error',
        );
      }
    } catch (error) {
      output.logError(
        'Error getting context from Kubernetes extension',
        error instanceof Error ? error.message : String(error),
      );
    }

    return result;
  }

  /**
   * Get the namespace from the Kubernetes extension's current context
   * Note: If you need both namespace and context, call getCurrentContext() directly
   * to avoid duplicate API calls.
   */
  static async getNamespace(): Promise<string | undefined> {
    const context = await this.getCurrentContext();
    return context.namespace;
  }

  /**
   * Get the context name from the Kubernetes extension
   * Note: If you need both namespace and context, call getCurrentContext() directly
   * to avoid duplicate API calls.
   */
  static async getContext(): Promise<string | undefined> {
    const context = await this.getCurrentContext();
    return context.context;
  }
}
