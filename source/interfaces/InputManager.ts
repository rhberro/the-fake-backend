import InputListenerPromiseResponse from './InputListenerPromiseResponse';

export default interface InputManager {
  /**
   * Register an event listener to a key.
   */
  addListener: (
    /**
     * The target key.
     */
    key: string,
    /**
     * The event callback.
     */
    event: () => Promise<InputListenerPromiseResponse> | void,
    /**
     * The control key state.
     */
    control?: boolean
  ) => void;
  init: Function;
}
