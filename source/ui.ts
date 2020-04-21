import { ProxyManager, ThrottlingManager, UIManager } from './interfaces';
import chalk from 'chalk';
import express from 'express';
import readline from 'readline';

/**
 * Create a new UI manager.
 *
 * @param {ProxyManager} proxyManager - The proxy manager.
 * @param {ThrottlingManager} throttlingManager - The throttling manager.
 *
 * @return {UIManager} The UI manager.
 */
export function createUIManager(
  proxyManager: ProxyManager,
  throttlingManager: ThrottlingManager
): UIManager {
  const display = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function write(text: string) {
    display.write(text);
  }

  /**
   * Clear the user screen.
   */
  function clear(): void {
    write('\x1b[2J');
    write('\x1b[0f');
  }

  /**
   * Write a line break to the user screen.
   */
  function linebreak(): void {
    write('\r\n');
  }

  /**
   * Write a message to the user screen followed by a line break.
   *
   * @param {Array<string>} parameters - An array of text to display.
   */
  function line(...parameters: Array<string>): void {
    write(parameters.join('\x20'));
    write('\r\n');
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

      line(chalk.bold.green('The service is running!'));

      line(chalk.blackBright('Connection:'));
      paragraph(
        (currentProxy && chalk.bold.white(currentProxy.name)) || 'Local',
        (currentProxy && chalk.bold.blackBright(currentProxy.host)) || ''
      );

      line(chalk.blackBright('Throttling:'));
      paragraph(
        (currentThrottling && chalk.bold.white(currentThrottling.name)) ||
          'Disabled',
        currentThrottling && chalk.bold.black(currentThrottling.values[0]),
        currentThrottling && chalk.bold.black('-'),
        currentThrottling && chalk.bold.black(currentThrottling.values[1]),
        currentThrottling && chalk.bold.black('ms')
      );

      line(
        'Press',
        chalk.bold.white('c'),
        'to toggle the connection,',
        chalk.bold.white('t'),
        'to toggle the throttling or',
        chalk.bold.white('o'),
        'to change endpoint settings according "overrides"',
        chalk.bold.white('q'),
        'to stop and quit the service.'
      );

      linebreak();
    },

    /**
     * Draw the request information to the user screen.
     *
     * @param {express.Request} req - The route request object.
     * @param {express.Response} res - The route response object.
     * @param {express.Request} next - The express next function.
     */
    drawRequest(
      req: express.Request,
      res: express.Response,
      next: Function
    ): void {
      const currentThrottling = throttlingManager.getCurrent();
      const currentThrottlingDelay = throttlingManager.getCurrentDelay();

      line(chalk.bold.white(req.path));
      line(
        currentThrottling &&
          chalk.blackBright('[' + currentThrottlingDelay + 'ms]')
      );

      next();
    },

    writeEndpointChanged: (
      routePath: string,
      routeMethodType: string,
      overrideNameSelected: string
    ) => {
      const endpoint = chalk.magenta(
        `(${routeMethodType.toUpperCase()}) ${routePath}`
      );

      display.write(
        `Endpoint ${endpoint} changed to response ${chalk.magenta(
          overrideNameSelected
        )}`
      );
      linebreak();
    },
  };
}
