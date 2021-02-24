import { ClientRequest } from 'http';
import { Request, Response } from '../interfaces';

type ProxyRequestHandler = (
  proxyReq: ClientRequest,
  req: Request,
  res: Response
) => void;

export default ProxyRequestHandler;
