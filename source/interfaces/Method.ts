import MethodOverride from './MethodOverride';
import MethodProperties from './MethodProperties';
import { MethodType } from '../enums';

export default interface Method extends MethodProperties {
  type: MethodType | 'get' | 'post' | 'put' | 'delete' | 'patch';
  overrides?: Array<MethodOverride>;
}
