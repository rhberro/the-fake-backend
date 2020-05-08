import { InputListener, InputManager } from './interfaces';
import readline from 'readline';

/**
 * Create a new input manager.
 *
 * @return The input manager
 */
export function createInputManager(): InputManager {
  const listeners: Array<InputListener> = [
    { key: 'q', control: false, event: process.exit },
    { key: 'c', control: true, event: process.exit },
  ];

  /**
   * Filter a listener using its name and control key.
   *
   * @param listener The input listener
   */
  function filterInputListener(
    this: readline.Key,
    listener: InputListener
  ): boolean {
    return listener.key === this.name && listener.control === this.ctrl;
  }

  /**
   * Filter and apply listeners that matches the event's properties.
   *
   * @param chunk Chunk
   * @param key The event key
   */
  function onKeyPress(chunk: any, key: readline.Key): void {
    listeners.filter(filterInputListener, key).map(executeEvent);
  }

  function isPromise(obj: any) {
    return Boolean(obj.then);
  }

  function executeEvent(listener: InputListener) {
    unbindKeypress();
    const eventResult = listener.event();

    if (eventResult && isPromise(eventResult)) {
      eventResult.then(() => {
        reopenStdinAfterInquirer();
      });
    } else {
      bindKeypress();
    }
  }

  function reopenStdinAfterInquirer() {
    readline.emitKeypressEvents(process.stdin);

    if (typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();
    bindKeypress();
  }

  function bindKeypress() {
    process.stdin.on('keypress', onKeyPress);
  }

  function unbindKeypress() {
    process.stdin.off('keypress', onKeyPress);
  }

  return {
    /**
     * Start listening to user inputs.
     *
     * @param raw The raw mode state
     */
    init(raw = true): void {
      readline.emitKeypressEvents(process.stdin);

      if (typeof process.stdin.setRawMode === 'function') {
        process.stdin.setRawMode(raw);
      }

      bindKeypress();
    },

    /**
     * Register an event listener to a key.
     *
     * @param key The target key
     * @param event The event callback
     * @param control The control key state
     */
    addListener(key, event, control = false): void {
      const listener: InputListener = { key, event, control };
      listeners.push(listener);
    },
  };
}
