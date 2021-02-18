import { NextFunction } from 'express';
import Method from './Method';
import Request from './Request';
import Response from './Response';
import Route from './Route';

type ResponseLocals<T> = {
  response: T;
  route: Route;
  routeMethod: Method;
};

interface MiddlewareResponse<T> extends Response<T> {
  locals: ResponseLocals<T>;
}

type Middleware<T = any> = (
  req: Request,
  res: MiddlewareResponse<T>,
  next: NextFunction
) => void;

export default Middleware;
