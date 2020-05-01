import { Request } from 'express';
import Search from './Search';

export default interface MethodProperties {
  code?: number;
  data?: any;
  file?: string;
  delay?: number;
  paginated?: boolean;
  search?: Search;
}
