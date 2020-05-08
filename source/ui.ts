import chalk from 'chalk';
import readline from 'readline';

import {
  ProxyManager,
  ThrottlingManager,
  UIManager,
  OverrideManager,
} from './interfaces';
import { formatMethodType } from './routes';

/**
 * Create a new UI manager.
 *
 * @param proxyManager The proxy manager
 * @param throttlingManager The throttling manager
 * @param overrideManager The routes overrides manager
 * @return The UI manager
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
   * @param parameters An array of text to display
   */
  function line(...parameters: Array<string>): void {
    write(parameters.join('\x20'));
    write('\r\n');
  }

  /**
   * Add two empty spaces before writing a message to the user screen followed by a line break.
   *
   * @param parameters An array of text to display
   */
  function paragraph(...parameters: Array<string>): void {
    line(' ', ...parameters);
  }

  function formatEndpoint(routePath: string, methodType: string) {
    return `${formatMethodType(methodType)} ${routePath}`;
  }

  function printConnection() {
    const connection = proxyManager.getCurrent();

    line(chalk.blackBright('Connection:'));
    if (connection) {
      paragraph(
        chalk.bold.white(connection.name),
        chalk.bold.blackBright(connection.host)
      );
    } else {
      paragraph('Local');
    }
  }

  function printConnectionOverrides() {
    line(chalk.blackBright('Connection overrides:'));
    const connectionOverrides = proxyManager.getOverriddenProxyRoutes();

    if (connectionOverrides.length) {
      connectionOverrides.forEach((route) =>
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

    const selectedOverrides = overrideManager.getAllSelected();

    if (selectedOverrides.length) {
      selectedOverrides.forEach(({ routePath, methodType, name }) =>
        paragraph(`- ${formatEndpoint(routePath, methodType)}: ${name}`)
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
     * @param req The route request object
     * @param res The route response object
     * @param next The express next function
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
        formatEndpoint(routePath, routeMethodType)
      );

      const override = chalk.magenta(selectedOverrideName);

      display.write(`Endpoint ${endpoint} changed to response ${override}`);
      linebreak();
    },

    writeRouteProxyChanged(routePath, selectedProxyName) {
      const route = chalk.magenta(routePath);
      const proxy = chalk.magenta(selectedProxyName);

      display.write(`Route ${route} changed to proxy ${proxy}`);
      linebreak();
    },
  };
}
