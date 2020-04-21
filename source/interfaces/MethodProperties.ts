import { Request } from 'express';
import Search from './Search';

export default interface MethodProperties {
  code?: number;
  data?: any | ((req: Request) => any);
  file?: string;
  paginated?: boolean;
  search?: Search;
}
