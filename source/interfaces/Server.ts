import RouteProperties from './RouteProperties';

export default interface Server {
  routes: (routes: RouteProperties[]) => void;
  listen: (port?: number | string) => void;
}
