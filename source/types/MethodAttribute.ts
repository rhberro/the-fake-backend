import { Request } from '../interfaces';

type MethodAttribute<P> = ((req: Request) => P) | P;

export default MethodAttribute;
