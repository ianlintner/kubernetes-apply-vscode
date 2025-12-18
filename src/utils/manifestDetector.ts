import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface K8sManifest {
  apiVersion?: string;
  kind?: string;
  metadata?: {
    name?: string;
    namespace?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface DetectionResult {
  isK8sManifest: boolean;
  isKustomization: boolean;
  manifests: K8sManifest[];
}

/**
 * Detects if a file is a Kubernetes manifest or Kustomization file
 * by analyzing its content and name
 */
export class ManifestDetector {
  /**
   * Analyzes a document and returns detection results
   */
  static analyzeDocument(
    document: vscode.TextDocument
  ): DetectionResult {
    const content = document.getText();
    const fileName = path.basename(document.fileName);

    // Check if it's a kustomization file by name
    const isKustomizationByName =
      fileName === 'kustomization.yaml' || fileName === 'kustomization.yml';

    // Try to parse YAML and extract manifests
    const { manifests, isK8s, isKustomization } =
      this.parseYamlContent(content, isKustomizationByName);

    return {
      isK8sManifest: isK8s,
      isKustomization: isKustomization,
      manifests,
    };
  }

  /**
   * Parses YAML content and extracts Kubernetes manifests
   * Handles both single and multi-document YAML files
   */
  private static parseYamlContent(
    content: string,
    isKustomizationByName: boolean
  ): {
    manifests: K8sManifest[];
    isK8s: boolean;
    isKustomization: boolean;
  } {
    const manifests: K8sManifest[] = [];
    let isK8s = false;
    let isKustomization = false;

    try {
      // Split by document separator (---)
      const documents = content
        .split(/^---\s*$/m)
        .map((doc) => doc.trim())
        .filter((doc) => doc.length > 0);

      for (const docContent of documents) {
        const doc = yaml.load(docContent) as K8sManifest | null;

        if (doc && typeof doc === 'object') {
          // Check if it's a valid K8s manifest
          if (this.isValidK8sResource(doc)) {
            isK8s = true;
            manifests.push(doc);
          }

          // Check if it's a Kustomization resource
          if (this.isKustomizationResource(doc)) {
            isKustomization = true;
            manifests.push(doc);
          }
        }
      }

      // If we have a kustomization.yaml file by name, mark it as such
      if (isKustomizationByName && manifests.length > 0) {
        isKustomization = true;
      }
    } catch (error) {
      // Invalid YAML, not a manifest
      return { manifests: [], isK8s: false, isKustomization: false };
    }

    return { manifests, isK8s, isKustomization };
  }

  /**
   * Validates if an object is a Kubernetes resource
   * Checks for required fields: apiVersion, kind, metadata
   */
  private static isValidK8sResource(obj: K8sManifest): boolean {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.apiVersion === 'string' &&
      typeof obj.kind === 'string' &&
      typeof obj.metadata === 'object' &&
      obj.metadata !== null
    );
  }

  /**
   * Validates if an object is a Kustomization resource
   */
  private static isKustomizationResource(obj: K8sManifest): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    return (
      obj.kind === 'Kustomization' &&
      obj.apiVersion === 'kustomize.config.k8s.io/v1beta1'
    );
  }

  /**
   * Gets the first manifest resource from a file
   * (useful for displaying metadata)
   */
  static getFirstManifest(manifests: K8sManifest[]): K8sManifest | null {
    return manifests.length > 0 ? manifests[0] : null;
  }

  /**
   * Checks if any of the manifests has a specific kind
   */
  static hasKind(manifests: K8sManifest[], kind: string): boolean {
    return manifests.some((manifest) => manifest.kind === kind);
  }
}
