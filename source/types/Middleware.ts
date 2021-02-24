import { NextFunction } from 'express';
import { Request, Response } from '../interfaces';

type Middleware<T = any> = (
  req: Request,
  res: Response<T>,
  next: NextFunction
) => void;

export default Middleware;
