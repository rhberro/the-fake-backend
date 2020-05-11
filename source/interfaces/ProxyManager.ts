import Proxy from './Proxy';
import Route from './Route';

export default interface ProxyManager {
  getAll: () => Proxy[];
  getCurrent: () => Proxy | null;
  getOverriddenProxyRoutes: () => Route[];
  toggleCurrent: () => void;
  chooseRouteProxy: () => Promise<Route>;
}
