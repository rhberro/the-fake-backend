import Route from './Route';

export default interface OverrideListenerOptions {
  /**
   * Getter of `allRoutes`.
   */
  getAllRoutes: () => Array<Route>;

  /**
   * Sets the current override methods selected.
   */
  selectMethodOverride: (
    /**
     * The route path that will be updated.
     */
    routePath: string,
    /**
     * The route method type that will be updated.
     */
    routeMethodType: string,
    /**
     * The override name selected.
     */
    overrideNameSelected?: string
  ) => void;
}
