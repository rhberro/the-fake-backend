import RouteProperties from './RouteProperties';
import Proxy from './Proxy';

export default interface Route extends RouteProperties {
  proxy?: Proxy | null;
}
