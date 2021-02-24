import { IncomingMessage } from 'http';
import { Request, Response } from '../interfaces';

type ProxyResponseHandler = (
  proxyRes: IncomingMessage,
  req: Request,
  res: Response
) => void;

export default ProxyResponseHandler;
