import express from 'express';

type MethodAttribute<P> = ((req: express.Request) => P) | P;

export default MethodAttribute;
