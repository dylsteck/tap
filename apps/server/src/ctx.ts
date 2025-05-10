import { type Context } from 'hono';

// @ts-ignore
export type AppEnv = Env;

export type HonoVariables = {
  // Empty for minimal implementation
};

export type HonoContext = Context<{ Variables: HonoVariables; Bindings: AppEnv }>;
