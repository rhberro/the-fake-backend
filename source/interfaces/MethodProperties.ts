import { Request } from 'express';
import Search from './Search';

export default interface MethodProperties {
  code?: number;
  data?: ((req: Request) => any) | string | object | number | boolean;
  file?: string;
  paginated?: boolean;
  search?: Search;
}
