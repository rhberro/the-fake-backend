export default interface InputListener {
  key: string;
  event: () => Promise<void> | void;
  control: boolean;
}
