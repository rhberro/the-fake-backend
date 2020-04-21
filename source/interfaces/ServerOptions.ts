import PaginationProperties from './PaginationProperties';
import Proxy from './Proxy';
import Throttling from './Throttling';

export default interface ServerOptions {
  middlewares?: Array<any>;
  pagination: PaginationProperties;
  proxies: Array<Proxy>;
  throttlings: Array<Throttling>;
}
