import ProxyResult from './ProxyResult';

export default interface ProxyManager {
  getAll: Function;
  getCurrent: () => ProxyResult | null;
  toggleCurrent: Function;
}
