import OverrideSelectResult from './OverrideSelectResult';
import RouteResult from './RouteResult';

export default interface OverrideManager {
  getAll: () => RouteResult[];
  getAllSelected: () => OverrideSelectResult[];
  choose: () => Promise<OverrideSelectResult>;
}
