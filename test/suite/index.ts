import * as assert from 'assert';
import * as vscode from 'vscode';
import Mocha from 'mocha';

export function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'bdd', color: true });
  mocha.suite.emit('pre-require', globalThis, 'global', mocha);

  describe('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    it('Extension should be present', () => {
      assert.ok(vscode.extensions.getExtension('k8smanifest.k8s-manifest-applier'));
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
