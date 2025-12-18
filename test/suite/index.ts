import * as assert from 'assert';
import * as vscode from 'vscode';
import Mocha from 'mocha';
import * as path from 'path';

export function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'bdd', color: true });
  mocha.suite.emit('pre-require', globalThis, 'global', mocha);

  describe('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    it('Extension should be present', () => {
      // The extension identifier is `${publisher}.${name}`.
      // Derive it from package.json so the test stays correct if the publisher changes.
      // (This runs from compiled JS under out/test/suite.)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pkg = require(path.resolve(__dirname, '..', '..', '..', 'package.json')) as {
        publisher: string;
        name: string;
      };

      const extensionId = `${pkg.publisher}.${pkg.name}`;
      assert.ok(
        vscode.extensions.getExtension(extensionId),
        `Expected extension '${extensionId}' to be present`
      );
    });
  });

  return new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  });
}
