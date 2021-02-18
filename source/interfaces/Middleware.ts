import { NextFunction } from 'express';
import Request from './Request';
import Response from './Response';

type Middleware<T = any> = (
  req: Request,
  res: Response<T>,
  next: NextFunction
) => void;

export default Middleware;
