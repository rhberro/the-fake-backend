import PaginationProperties from './PaginationProperties';
import ProxyProperties from './ProxyProperties';
import Throttling from './Throttling';

export default interface ServerOptions {
  middlewares?: Array<any>;
  pagination?: PaginationProperties;
  proxies: Array<ProxyProperties>;
  throttlings: Array<Throttling>;
}
