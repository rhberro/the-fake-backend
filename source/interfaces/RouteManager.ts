import RouteResult from './RouteResult';

export default interface RouteManager {
  getAll: () => RouteResult[];
  setAll: (routes: RouteResult[]) => void;
}
