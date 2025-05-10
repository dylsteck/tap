import type { Context } from 'hono';
import type { Env } from './types.d';

export type AppContext = Context<{ Bindings: Env }>;
