import { RequestHandler } from 'http-proxy-middleware';

export default interface Proxy {
  name: string;
  host: string;
  handler: RequestHandler;
}
