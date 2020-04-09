import MethodOverride from './MethodOverride';
import MethodProperties from './MethodProperties';
import { MethodType } from '../enums';
import Search from './Search';

export default interface Method extends MethodProperties {
  type: MethodType | 'get' | 'post' | 'put' | 'delete' | 'patch';
  search: Search;
  overrides?: Array<MethodOverride>;
}
