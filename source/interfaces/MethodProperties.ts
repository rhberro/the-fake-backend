import Search from "./Search";

export default interface MethodProperties {
  code?: number,
  data?: any,
  file?: string,
  paginated?: boolean,
  search?: Search,
}
