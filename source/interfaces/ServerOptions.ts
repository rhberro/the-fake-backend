import PaginationProperties from './PaginationProperties';
import ProxyProperties from './ProxyProperties';
import Throttling from './Throttling';
import MethodOverride from './MethodOverride';

export default interface ServerOptions {
  basePath?: string;
  middlewares?: Array<any>;
  pagination?: PaginationProperties;
  proxies: Array<ProxyProperties>;
  throttlings: Array<Throttling>;
  overrides?: Array<MethodOverride>;
}
