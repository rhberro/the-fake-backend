import Search from "./Search";

export default interface Method {
  code: number,
  data: any,
  file: string,
  paginated: boolean,
  search: Search,
  type: 'get' | 'post' | 'put' | 'delete' | 'patch',
}
