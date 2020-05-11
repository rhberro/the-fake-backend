import Override from './Override';
import Route from './Route';

export default interface OverrideManager {
  getAll: () => Route[];
  getAllSelected: () => Override[];
  choose: () => Promise<Override>;
}
