import { InputListener } from './interfaces';
import readline from 'readline';

export class InputManager {
  private listeners: Array<InputListener>;

  /**
   * Filter a listener using its name and control key.
   *
   * @param listener The input listener
   */
  private filterInputListener(
    key: readline.Key,
    listener: InputListener
  ): boolean {
    return listener.key === key.name && listener.control === key.ctrl;
  }

  /**
   * Filter and apply listeners that matches the event's properties.
   *
   * @param chunk Chunk
   * @param key The event key
   */
  private onKeyPress(chunk: any, key: readline.Key): void {
    this.listeners
      .filter((listener) => this.filterInputListener(key, listener))
      .forEach(this.executeEvent);
  }

  private isPromise(obj: any) {
    return Boolean(obj.then);
  }

  private executeEvent(listener: InputListener) {
    this.unbindKeypress();
    const eventResult = listener.event();

    if (eventResult && this.isPromise(eventResult)) {
      eventResult.then(() => {
        this.reopenStdinAfterInquirer();
      });
    } else {
      this.bindKeypress();
    }
  }

  private reopenStdinAfterInquirer() {
    readline.emitKeypressEvents(process.stdin);

    if (typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();
    this.bindKeypress();
  }

  private bindKeypress() {
    process.stdin.on('keypress', this.onKeyPress);
  }

  private unbindKeypress() {
    process.stdin.off('keypress', this.onKeyPress);
  }

  /**
   * Creates a new input manager.
   */
  constructor() {
    this.executeEvent = this.executeEvent.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);

    this.listeners = [
      { key: 'q', control: false, event: process.exit },
      { key: 'c', control: true, event: process.exit },
    ];
  }

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

    this.bindKeypress();
  }

  /**
   * Register an event listener to a key.
   *
   * @param key The target key
   * @param event The event callback
   * @param control The control key state
   */
  addListener(
    key: string,
    event: () => Promise<void> | void,
    control: boolean = false
  ): void {
    const listener: InputListener = { key, event, control };
    this.listeners.push(listener);
  }
}
