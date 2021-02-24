import { ClientRequest } from 'http';
import Request from './Request';
import Response from './Response';

export default interface ProxyProperties {
  name: string;
  host: string;
  appendBasePath?: boolean;
  onProxyReq?: (proxyReq: ClientRequest, req: Request, res: Response) => void;
}
