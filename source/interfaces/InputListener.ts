import InputListenerPromiseResponse from './InputListenerPromiseResponse';

export default interface InputListener {
  key: string;
  control: boolean;
  event: () => Promise<InputListenerPromiseResponse> | void;
}
