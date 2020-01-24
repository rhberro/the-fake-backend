import * as chalk from 'chalk';
import * as readline from 'readline';

import ProxyManager from "./interfaces/ProxyManager";
import ThrottlingManager from "./interfaces/ThrottlingManager";
import UIManager from "./interfaces/UIManager";

export function createUIManager(proxyManager: ProxyManager, throttlingManager: ThrottlingManager): UIManager {
  const display = readline.createInterface(
    {
      input: process.stdin,
      output: process.stdout
    }
  );

  function clear() {
    display.write('\x1b[2J');
    display.write('\x1b[0f');
  }
  
  function line(...parameters: Array<string>): void {
    display.write(parameters.join('\x20'));
    display.write('\r\n');
  }
  
  function paragraph(...parameters: Array<string>): void {
    line(' ', ...parameters);
  }
  
  function title(text: string): void {
    line(chalk.bold.green(text));
  }

  return {
    drawDashboard(port: number) {
      const currentProxy = proxyManager.getCurrent();
      const currentThrottling = throttlingManager.getCurrent();

      clear();

      title('The service is running!');

      paragraph(
        chalk.bold.blackBright('Connections:'),
        (currentProxy && currentProxy.name) || 'Local',
      );

      paragraph(
        chalk.bold.blackBright('Throttlings:'),
        (currentThrottling && currentThrottling.name) || 'Disabled',
      );

      line('Press', chalk.bold('q'), 'to stop and quit the service or', chalk.bold('r'), 'to redraw.');
    },
  }
}
