import PaginationProperties from './PaginationProperties';
import ProxyProperties from './ProxyProperties';
import Throttling from './Throttling';
import MethodOverride from './MethodOverride';
import { RequestHandler } from 'express';

export default interface ServerOptions {
  basePath?: string;
  docsRoute?: string;
  definitions?: TemplateStringsArray | string;
  middlewares?: Array<RequestHandler>;
  overrides?: Array<MethodOverride>;
  pagination?: PaginationProperties;
  proxies: Array<ProxyProperties>;
  throttlings: Array<Throttling>;
}
