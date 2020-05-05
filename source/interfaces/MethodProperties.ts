import Search from './Search';
import { MethodAttribute, ResponseHeaders } from '../types';
import PaginationProperties from './PaginationProperties';
import express from 'express';

export default interface MethodProperties {
  code?: number;
  data?: MethodAttribute<any>;
  file?: MethodAttribute<string>;
  headers?: MethodAttribute<ResponseHeaders>;
  delay?: number;
  pagination?: boolean | PaginationProperties;
  overrideContent?: (req: express.Request, content: any) => any;
  search?: Search;
}
