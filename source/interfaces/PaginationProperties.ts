export default interface PaginationProperties {
  additionalMetadata?: Record<string, any>;
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
