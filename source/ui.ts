import chalk from 'chalk';
import readline, { Interface as ReadLine } from 'readline';

import { Middleware } from './types';
import { OverrideManager } from './overrides';
import { ProxyManager } from './proxy';
import { ThrottlingManager } from './throttling';
import { formatMethodType } from './routes';

function formatEndpoint(routePath: string, methodType: string) {
  return `${formatMethodType(methodType)} ${routePath}`;
}

export class UIManager {
  private display: ReadLine;
  private proxyManager: ProxyManager;
  private overrideManager: OverrideManager;
  private throttlingManager: ThrottlingManager;

  /**
   * Write a text to the user screen.
   *
   * @param text The text
   */
  private write(text: string) {
    this.display.write(text);
  }

  /**
   * Clear the user screen.
   */
  private clear() {
    this.write('\x1b[2J');
    this.write('\x1b[0f');
  }

  /**
   * Write a line break to the user screen.
   */
  private linebreak() {
    this.write('\r\n');
  }

  /**
   * Write a message to the user screen followed by a line break.
   *
   * @param parameters An array of text to display
   */
  private line(...parameters: string[]) {
    this.write(parameters.join('\x20'));
    this.write('\r\n');
  }

  /**
   * Add two empty spaces before writing a message to the user screen followed by a line break.
   *
   * @param parameters An array of text to display
   */
  private paragraph(...parameters: string[]) {
    this.line(' ', ...parameters);
  }

  private printConnection() {
    const connection = this.proxyManager.getCurrent();

    this.line(chalk.blackBright('Connection:'));
    if (connection) {
      this.paragraph(
        chalk.bold.white(connection.name),
        chalk.bold.blackBright(connection.host)
      );
    } else {
      this.paragraph('Local');
    }
  }

  private printConnectionOverrides() {
    this.line(chalk.blackBright('Connection overrides:'));
    const connectionOverrides = this.proxyManager.getOverriddenProxyRoutes();

    if (connectionOverrides.length) {
      connectionOverrides.forEach((route) =>
        this.paragraph(`- ${`${route.path}: ${route.proxy?.name || 'Local'}`}`)
      );
    } else {
      this.paragraph('None');
    }
  }

  private printThrottling() {
    const currentThrottling = this.throttlingManager.getCurrent();

    this.line(chalk.blackBright('Throttling:'));
    if (currentThrottling) {
      this.paragraph(
        chalk.bold.white(currentThrottling.name),
        chalk.bold.black(currentThrottling.values[0]),
        chalk.bold.black('-'),
        chalk.bold.black(currentThrottling.values[1]),
        chalk.bold.black('ms')
      );
    } else {
      this.paragraph('Disabled');
    }
  }

  private printOverrides() {
    this.line(chalk.blackBright('Overrides:'));

    const selectedOverrides = this.overrideManager.getAllSelected();

    if (selectedOverrides.length) {
      selectedOverrides.forEach(({ routePath, methodType, name }) =>
        this.paragraph(`- ${formatEndpoint(routePath, methodType)}: ${name}`)
      );
    } else {
      this.paragraph('None');
    }
  }

  private printAvailableCommands() {
    this.line('Available commands:');
    this.paragraph(`- ${chalk.bold.white('c')} to toggle the connection`);
    this.paragraph(`- ${chalk.bold.white('t')} to toggle the throttling`);
    this.paragraph(
      `- ${chalk.bold.white(
        'o'
      )} to change endpoint settings according to "overrides"`
    );
    this.paragraph(
      `- ${chalk.bold.white('p')} to toggle the connection to an endpoint`
    );
    this.paragraph(`- ${chalk.bold.white('q')} to stop and quit the service`);
    this.linebreak();
  }

  /**
   * Create a new UI manager.
   *
   * @param proxyManager The proxy manager
   * @param throttlingManager The throttling manager
   * @param overrideManager The routes overrides manager
   * @return The UI manager
   */
  constructor(
    proxyManager: ProxyManager,
    throttlingManager: ThrottlingManager,
    overrideManager: OverrideManager
  ) {
    this.display = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.proxyManager = proxyManager;
    this.throttlingManager = throttlingManager;
    this.overrideManager = overrideManager;
  }

  /**
   * Clear the screen and draw a new dashboard.
   */
  drawDashboard() {
    this.clear();

    this.line(chalk.bold.green('The service is running!'));

    this.printConnection();
    this.printConnectionOverrides();
    this.printThrottling();
    this.printOverrides();
    this.printAvailableCommands();
  }

  /**
   * Draw the request information to the user screen.
   *
   * @param req The route request object
   * @param res The route response object
   * @param next The express next function
   */
  createDrawRequestMiddleware(): Middleware {
    return (req, _res, next) => {
      const currentThrottling = this.throttlingManager.getCurrent();
      const currentThrottlingDelay = this.throttlingManager.getCurrentDelay();

      this.line(chalk.bold.white(`${req.method} ${req.path}`));
      if (currentThrottling) {
        this.line(chalk.blackBright('[' + currentThrottlingDelay + 'ms]'));
      }

      next();
    };
  }

  /**
   * Draw that a route method override was selected.
   *
   * @param routePath The overridden route path
   * @param routeMethodType The overridden route method type
   * @param selectedOverrideName The selected override name
   */
  drawMethodOverrideChanged(
    routePath: string,
    routeMethodType: string,
    selectedOverrideName: string
  ) {
    const endpoint = chalk.magenta(formatEndpoint(routePath, routeMethodType));
    const override = chalk.magenta(selectedOverrideName);

    this.display.write(`Endpoint ${endpoint} changed to response ${override}`);
    this.linebreak();
  }

  /**
   * Draw that a route proxy was selected.
   *
   * @param routePath The route path
   * @param selectedProxyName The selected proxy name
   */
  drawRouteProxyChanged(routePath: string, selectedProxyName: string) {
    const route = chalk.magenta(routePath);
    const proxy = chalk.magenta(selectedProxyName);

    this.display.write(`Route ${route} changed to proxy ${proxy}`);
    this.linebreak();
  }
}
