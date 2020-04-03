import Method from "./Method";

export default interface Route {
  path: string,
  methods: Array<Method>,
}
