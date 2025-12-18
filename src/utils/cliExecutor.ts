import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface CommandOptions {
  context?: string;
  namespace?: string;
  dryRun?: boolean;
  cwd?: string;
}

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Executes kubectl and kustomize commands safely with error handling
 */
export class CliExecutor {
  /**
   * Applies a Kubernetes manifest file
   */
  static async applyManifest(
    filePath: string,
    options: CommandOptions = {},
  ): Promise<CommandResult> {
    const args = ['apply', '-f', filePath];

    if (options.context) {
      args.push('--context', options.context);
    }
    if (options.namespace) {
      args.push('--namespace', options.namespace);
    }
    if (options.dryRun) {
      args.push('--dry-run=client');
    }

    return this.executeCommand('kubectl', args, options.cwd);
  }

  /**
   * Validates a Kubernetes manifest without applying
   */
  static async validateManifest(
    filePath: string,
    options: CommandOptions = {},
  ): Promise<CommandResult> {
    const args = ['apply', '-f', filePath, '--dry-run=client', '--validate=true'];

    if (options.context) {
      args.push('--context', options.context);
    }
    if (options.namespace) {
      args.push('--namespace', options.namespace);
    }

    return this.executeCommand('kubectl', args, options.cwd);
  }

  /**
   * Builds a Kustomization and pipes to kubectl apply
   */
  static async buildKustomize(
    dirPath: string,
    options: CommandOptions = {},
  ): Promise<CommandResult> {
    // First build with kustomize
    const buildResult = await this.executeCommand('kustomize', ['build', dirPath], options.cwd);

    if (!buildResult.success) {
      return buildResult;
    }

    // Then pipe to kubectl apply
    const args = ['apply', '-f', '-'];

    if (options.context) {
      args.push('--context', options.context);
    }
    if (options.namespace) {
      args.push('--namespace', options.namespace);
    }
    if (options.dryRun) {
      args.push('--dry-run=client');
    }

    return this.executeCommandWithStdin('kubectl', args, buildResult.stdout, options.cwd);
  }

  /**
   * Applies a Kustomization directly
   */
  static async applyKustomize(
    dirPath: string,
    options: CommandOptions = {},
  ): Promise<CommandResult> {
    const args = ['apply', '-k', dirPath];

    if (options.context) {
      args.push('--context', options.context);
    }
    if (options.namespace) {
      args.push('--namespace', options.namespace);
    }
    if (options.dryRun) {
      args.push('--dry-run=client');
    }

    return this.executeCommand('kubectl', args, options.cwd);
  }

  /**
   * Checks if kubectl is available
   */
  static async isKubectlAvailable(): Promise<boolean> {
    const result = await this.executeCommand('kubectl', ['version', '--client']);
    return result.success;
  }

  /**
   * Checks if kustomize is available
   */
  static async isKustomizeAvailable(): Promise<boolean> {
    const result = await this.executeCommand('kustomize', ['version']);
    return result.success;
  }

  /**
   * Gets current kubectl context
   */
  static async getCurrentContext(): Promise<string> {
    const result = await this.executeCommand('kubectl', ['config', 'current-context']);
    return result.success ? result.stdout.trim() : 'default';
  }

  /**
   * Lists available kubectl contexts
   */
  static async listContexts(): Promise<string[]> {
    const result = await this.executeCommand('kubectl', ['config', 'get-contexts', '-o', 'name']);
    if (!result.success) {
      return [];
    }
    return result.stdout
      .trim()
      .split('\n')
      .filter((ctx) => ctx.length > 0);
  }

  /**
   * Internal: Executes a command and returns result
   */
  private static async executeCommand(
    command: string,
    args: string[],
    cwd?: string,
  ): Promise<CommandResult> {
    try {
      const result = await execFileAsync(command, args, {
        cwd: cwd || process.cwd(),
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: 0,
      };
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException & {
        stdout?: string;
        stderr?: string;
      };
      return {
        success: false,
        stdout: err.stdout ?? '',
        stderr: err.stderr ?? err.message ?? 'Unknown error',
        exitCode: typeof err.code === 'number' ? err.code : 1,
      };
    }
  }

  /**
   * Internal: Executes a command with stdin input
   */
  private static async executeCommandWithStdin(
    command: string,
    args: string[],
    stdin: string,
    cwd?: string,
  ): Promise<CommandResult> {
    return new Promise((resolve) => {
      try {
        const child = execFile(command, args, {
          cwd: cwd || process.cwd(),
          maxBuffer: 10 * 1024 * 1024,
        });

        let stdout = '';
        let stderr = '';

        child.stdout?.on('data', (data) => {
          stdout += data;
        });

        child.stderr?.on('data', (data) => {
          stderr += data;
        });

        child.on('close', (code) => {
          resolve({
            success: code === 0,
            stdout,
            stderr,
            exitCode: code || 1,
          });
        });

        child.stdin?.write(stdin);
        child.stdin?.end();
      } catch (error: unknown) {
        const err = error as NodeJS.ErrnoException;
        resolve({
          success: false,
          stdout: '',
          stderr: err?.message || 'Unknown error',
          exitCode: 1,
        });
      }
    });
  }
}
