import Route from './Route';

export default interface Server {
  routes: (routes: Route[]) => void;
  listen: (port?: number | string) => void;
}
