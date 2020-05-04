import Search from './Search';
import { ResponseHeaders } from '../types';
import PaginationProperties from './PaginationProperties';

export default interface MethodProperties {
  code?: number;
  data?: any;
  file?: string;
  headers?: ResponseHeaders;
  delay?: number;
  pagination?: boolean | PaginationProperties;
  search?: Search;
}
