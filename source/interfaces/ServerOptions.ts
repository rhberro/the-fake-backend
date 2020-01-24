import Proxy from "./Proxy";
import Throttling from "./Throttling";

export default interface ServerOptions {
  middlewares?: Array<any>,
  proxies: Array<Proxy>,
  throttlings: Array<Throttling>,
};
