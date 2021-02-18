import express from 'express';

export default interface Response<T = any> extends express.Response<T> {}
