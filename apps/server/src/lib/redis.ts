import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv()

export async function checkKey(key: string, init?: ResponseInit): Promise<Response | null>{
    const data = await redis.get(key);
    if(data && typeof data === "string"){
        return new Response(JSON.stringify(JSON.parse(data)), init ? init : undefined);
    }
    return null;
}

export async function setKey(key: string, value: string, ex: number, init?: ResponseInit): Promise<Response>{
    await redis.set(key, value, { ex });
    return new Response(value, init ? init : undefined);
}