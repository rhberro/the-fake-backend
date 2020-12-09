import Search from './Search';
import { MethodAttribute, ResponseHeaders } from '../types';
import PaginationProperties from './PaginationProperties';
import Request from './Request';

export default interface MethodProperties {
  code?: number;
  data?: MethodAttribute<any>;
  file?: MethodAttribute<string>;
  scenario?: string;
  headers?: MethodAttribute<ResponseHeaders>;
  delay?: number;
  pagination?: boolean | PaginationProperties;
  overrideContent?: (req: Request, content: any) => any;
  search?: Search;
}
