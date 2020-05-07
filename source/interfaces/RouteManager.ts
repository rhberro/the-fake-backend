import RouteResult from './RouteResult';

export default interface RouteManager {
  getAll: () => RouteResult[];
  getWithOverrides: () => RouteResult[];
  setAll: (routes: RouteResult[]) => void;
}
