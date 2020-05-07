import OverrideSelectResult from './OverrideSelectResult';

export default interface OverrideManager {
  getSelected: () => OverrideSelectResult[];
  choose: () => Promise<OverrideSelectResult>;
}
