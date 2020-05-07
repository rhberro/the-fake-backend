import Route from './Route';
import ProxyResult from './ProxyResult';

export default interface RouteResult extends Route {
  proxy?: ProxyResult | null;
}
