import {
  ProxyManager,
  ThrottlingManager,
  UIManager,
  OverrideManager,
} from './interfaces';
import chalk from 'chalk';
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
  throttlingManager: ThrottlingManager,
  overrideManager: OverrideManager
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

  function printConnection() {
    const currentProxy = proxyManager.getCurrent();

    line(chalk.blackBright('Connection:'));
    if (currentProxy) {
      paragraph(
        chalk.bold.white(currentProxy.name),
        chalk.bold.blackBright(currentProxy.host)
      );
    } else {
      paragraph('Local');
    }
  }

  function printConnectionOverrides() {
    line(chalk.blackBright('Connection overrides:'));
    const overriddenRoutesProxies = proxyManager.getOverriddenRoutesProxies();

    if (overriddenRoutesProxies.length) {
      overriddenRoutesProxies.forEach((route) =>
        paragraph(`- ${`${route.path}: ${route.proxy?.name || 'Local'}`}`)
      );
    } else {
      paragraph('None');
    }
  }

  function printThrottling() {
    const currentThrottling = throttlingManager.getCurrent();

    line(chalk.blackBright('Throttling:'));
    if (currentThrottling) {
      paragraph(
        chalk.bold.white(currentThrottling.name),
        chalk.bold.black(currentThrottling.values[0]),
        chalk.bold.black('-'),
        chalk.bold.black(currentThrottling.values[1]),
        chalk.bold.black('ms')
      );
    } else {
      paragraph('Disabled');
    }
  }

  function printOverrides() {
    line(chalk.blackBright('Overrides:'));

    const selectedOverrides = overrideManager.getSelected();

    if (selectedOverrides.length) {
      selectedOverrides.forEach((override) =>
        paragraph(
          `- ${override.method.type.toUpperCase()} ${override.route.path}: ${
            override.name
          }`
        )
      );
    } else {
      paragraph('None');
    }
  }

  function printAvailableCommands() {
    line('Available commands:');
    paragraph(`- ${chalk.bold.white('c')} to toggle the connection`);
    paragraph(`- ${chalk.bold.white('t')} to toggle the throttling`);
    paragraph(
      `- ${chalk.bold.white(
        'o'
      )} to change endpoint settings according to "overrides"`
    );
    paragraph(
      `- ${chalk.bold.white('p')} to toggle the connection to an endpoint`
    );
    paragraph(`- ${chalk.bold.white('q')} to stop and quit the service`);
    linebreak();
  }

  return {
    /**
     * Clear the screen and draw a new dashboard.
     */
    drawDashboard() {
      clear();

      line(chalk.bold.green('The service is running!'));

      printConnection();
      printConnectionOverrides();
      printThrottling();
      printOverrides();
      printAvailableCommands();
    },

    /**
     * Draw the request information to the user screen.
     *
     * @param {express.Request} req - The route request object.
     * @param {express.Response} res - The route response object.
     * @param {express.Request} next - The express next function.
     */
    drawRequest(req, res, next) {
      const currentThrottling = throttlingManager.getCurrent();
      const currentThrottlingDelay = throttlingManager.getCurrentDelay();

      line(chalk.bold.white(req.path));
      if (currentThrottling) {
        line(chalk.blackBright('[' + currentThrottlingDelay + 'ms]'));
      }

      next();
    },

    writeMethodOverrideChanged(
      routePath,
      routeMethodType,
      selectedOverrideName
    ) {
      const endpoint = chalk.magenta(
        `(${routeMethodType.toUpperCase()}) ${routePath}`
      );

      display.write(
        `Endpoint ${endpoint} changed to response ${chalk.magenta(
          selectedOverrideName
        )}`
      );
      linebreak();
    },

    writeRouteProxyChanged(routePath, selectedProxyName) {
      const route = chalk.magenta(routePath);

      display.write(
        `Route ${route} changed to proxy ${chalk.magenta(selectedProxyName)}`
      );
      linebreak();
    },
  };
}
