import { Route } from 'interfaces/Route';

export interface Server {
  routes: (routes: Route[]) => void;
  listen: (port: number) => void;
}
