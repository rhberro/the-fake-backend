import MethodOverride from "./MethodOverride";
import MethodProperties from "./MethodProperties";
import Search from "./Search";

export default interface Method extends MethodProperties {
  type: "get" | "post" | "put" | "delete" | "patch",
  search: Search,
  overrides?: Array<MethodOverride>,
}
