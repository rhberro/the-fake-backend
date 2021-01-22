import { Method } from 'interfaces/Method';

export interface Route {
  path: string;
  methods: Method[];
}
