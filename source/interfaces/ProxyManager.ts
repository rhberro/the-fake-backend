import Proxy from './Proxy';
import ProxyResult from './ProxyResult';
import RouteResult from './RouteResult';

export default interface ProxyManager {
  getAll: () => Proxy[];
  getCurrent: () => ProxyResult | null;
  toggleCurrent: () => void;
  getOverriddenProxyRoutes: () => RouteResult[];
  chooseRouteProxy: () => Promise<RouteResult>;
}
