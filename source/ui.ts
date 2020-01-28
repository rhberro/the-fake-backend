import * as chalk from 'chalk';
import * as readline from 'readline';

import ProxyManager from "./interfaces/ProxyManager";
import ThrottlingManager from "./interfaces/ThrottlingManager";
import UIManager from "./interfaces/UIManager";

/**
 * Create a new UI manager.
 *
 * @param {ProxyManager} proxyManager - The proxy manager.
 * @param {ThrottlingManager} throttlingManager - The throttling manager.
 *
 * @return {UIManager} The UI manager.
 */
export function createUIManager(proxyManager: ProxyManager, throttlingManager: ThrottlingManager): UIManager {
  const display = readline.createInterface(
    {
      input: process.stdin,
      output: process.stdout,
    }
  );

  /**
   * Clear the user screen.
   */
  function clear(): void {
    display.write('\x1b[2J');
    display.write('\x1b[0f');
  }

  /**
   * Write a message to the user screen followed by a line break.
   * 
   * @param {Array<string>} parameters - An array of text to display.
   */
  function line(...parameters: Array<string>): void {
    display.write(parameters.join('\x20'));
    display.write('\r\n');
  }

  /**
   * Add two empty spaces before writing a message to the user screen followed by a line break.
   * 
   * @param {Array<string>} parameters - An array of text to display.
   */
  function paragraph(...parameters: Array<string>): void {
    line(' ', ...parameters);
  }

  return {
    /**
     * Clear the screen and draw a new dashboard.
     */
    drawDashboard(): void {
      const currentProxy = proxyManager.getCurrent();
      const currentThrottling = throttlingManager.getCurrent();

      clear();

      line('The service is running!');

      paragraph(
        chalk.bold.blackBright('Connection:'),
        (currentProxy && chalk.white(currentProxy.name)) || 'Local',
        currentProxy && chalk.bold.black(currentProxy.host),
      );

      paragraph(
        chalk.bold.blackBright('Throttling:'),
        (currentThrottling && chalk.white(currentThrottling.name)) || 'Disabled',
        currentThrottling && chalk.bold.black(currentThrottling.values[0]),
        currentThrottling && chalk.bold.black('-'),
        currentThrottling && chalk.bold.black(currentThrottling.values[1]),
        currentThrottling && chalk.bold.black('ms'),
      );

      line('Press', chalk.bold.white('q'), 'to stop and quit the service or', chalk.bold.white('r'), 'to redraw.');
    },
  }
}
