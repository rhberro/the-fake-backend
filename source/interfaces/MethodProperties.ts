import Search from './Search';
import { ResponseHeaders } from '../types';
import PaginationProperties from './PaginationProperties';
import express from 'express';

export default interface MethodProperties {
  code?: number;
  data?: any;
  file?: string;
  headers?: ((req: express.Request) => ResponseHeaders) | ResponseHeaders;
  delay?: number;
  pagination?: boolean | PaginationProperties;
  overrideContent?: (req: express.Request, content: any) => any;
  search?: Search;
}
