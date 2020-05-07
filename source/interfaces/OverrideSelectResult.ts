import Method from './Method';
import RouteResult from './RouteResult';

export default interface OverrideSelectResult {
  route: RouteResult;
  method: Method;
  name: string;
}
