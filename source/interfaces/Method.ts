import MethodOverride from './MethodOverride';
import MethodProperties from './MethodProperties';

export default interface Method extends MethodProperties {
  type: 'get' | 'post' | 'put' | 'delete' | 'patch';
  overrides?: Array<MethodOverride>;
}
