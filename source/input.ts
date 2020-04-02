import InputListener from './interfaces/InputListener';
import InputManager from './interfaces/InputManager';
import readline from 'readline';
import tty from 'tty';

/**
 * Create a new input manager.
 *
 * @return {InputManager} The input manager.
 */
export function createInputManager(): InputManager {
  const listeners: Array<InputListener> = [
    { key: 'q', control: false, event: process.exit },
    { key: 'c', control: true, event: process.exit },
  ];

  /**
   * Filter a listener using its name and control key.
   *
   * @param {InputListener} listener - The input listener.
   */
  function filterInputListener(this: readline.Key, listener: InputListener): boolean {
    return listener.key === this.name && listener.control === this.ctrl;
  }

  /**
   * Filter and apply listeners that matches the event's properties.
   *
   * @param {any} chunk
   * @param {readline.key} key - The event key.
   */
  function onKeyPress(chunk: any, key: readline.Key): void {
    listeners
      .filter(
        filterInputListener, key
      ).map(executeEvent);
  }

  function executeEvent(listener: InputListener) {
    const eventResult = listener.event()
    const isPromise = Boolean(eventResult && eventResult.then)

    if (isPromise) {
      eventResult.then(() => {
        console.log('THEN')
      }).catch(() => {
        console.log('CATCH')
      })
    }
  }

  return {
    /**
     * Start listening to user inputs.
     *
     * @param {boolean} raw - The raw mode state.
     */
    init(raw: boolean = true): void {
      readline.emitKeypressEvents(process.stdin);

      if (typeof process.stdin.setRawMode === "function") {
        process.stdin.setRawMode(raw);
        process.stdin.on('keypress', onKeyPress);
      }
    },

    /**
     * Register an event listener to a key.
     *
     * @param {string} key - The target key.
     * @param {Function} event - The event callback.
     * @param {boolean} control - The control key state.
     */
    addListener(key: string, event: Function, control: boolean = false): void {
      const listener: InputListener = { key, event, control };
      listeners.push(listener);
    },
  };
}
