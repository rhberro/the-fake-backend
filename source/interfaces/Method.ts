export default interface Method {
  code: number,
  data: any,
  file: string,
  type: 'get' | 'post' | 'put' | 'delete' | 'patch',
}
