import express from 'express';
import Method from './Method';
import Route from './Route';

type ResponseLocals<T> = {
  response: T;
  route: Route;
  routeMethod: Method;
};

export default interface Response<T = any> extends express.Response<T> {
  locals: ResponseLocals<T>;
}
