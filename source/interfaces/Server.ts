export default interface Server {
  routes: Function;
  listen: Function;

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
