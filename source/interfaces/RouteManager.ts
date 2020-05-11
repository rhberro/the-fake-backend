import Route from './Route';

export default interface RouteManager {
  getAll: () => Route[];
  setAll: (routes: Route[]) => void;
}
