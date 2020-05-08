import express from 'express';

export default interface UIManager {
  drawDashboard: () => void;
  drawRequest: (
    req: express.Request,
    res: express.Response,
    next: Function
  ) => void;
  writeMethodOverrideChanged: (
    routePath: string,
    routeMethodType: string,
    selectedOverrideName: string
  ) => void;
  writeRouteProxyChanged: (
    routePath: string,
    selectedProxyName: string
  ) => void;
}
