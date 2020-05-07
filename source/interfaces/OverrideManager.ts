import OverrideSelectResult from './OverrideSelectResult';

export default interface OverrideManager {
  getSelected: () => OverrideSelectResult[];
  select: () => Promise<OverrideSelectResult>;
}
