import { ClientRequest } from 'http';

type ProxyRequestHandler = (
  proxyReq: ClientRequest,
  req: Request,
  res: Response
) => void;

export default ProxyRequestHandler;
