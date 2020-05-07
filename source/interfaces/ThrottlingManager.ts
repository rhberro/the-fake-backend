import Throttling from './Throttling';

export default interface ThrottlingManager {
  getAll: () => Throttling[];
  getCurrent: () => Throttling | null;
  getCurrentDelay: () => number;
  toggleCurrent: () => void;
}
