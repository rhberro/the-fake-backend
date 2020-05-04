export default interface PaginationProperties {
  count?: string;
  data?: string;
  empty?: string;
  first?: string;
  headers?: boolean;
  offsetParameter?: string;
  last?: string;
  next?: string;
  page?: string;
  pageParameter?: string;
  pages?: string;
  sizeParameter?: string;
  total?: string;
}

export interface ResolvedPaginationProperties {
  count: string;
  data: string;
  empty: string;
  first: string;
  headers: boolean;
  offsetParameter: string;
  last: string;
  next: string;
  page: string;
  pageParameter: string;
  pages: string;
  sizeParameter: string;
  total: string;
}
