import PaginationProperties from "./PaginationProperties";

export default interface ServerOptions {
  middlewares?: Array<any>,
  pagination?: PaginationProperties,
}
