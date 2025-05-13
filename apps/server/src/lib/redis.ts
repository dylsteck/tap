import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv()

/**
 * Retrieves a value from Redis by its key.
 * If the key exists and the value is a string, it parses the value
 * and returns it as a JSON response. If the key does not exist
 * or the value is not a string, it returns null.
 * 
 * @param {string} key - The key to retrieve from Redis.
 * @param {ResponseInit} [init] - Optional response initialization parameters.
 * @returns {Promise<Response | null>} - A promise that resolves to a Response object or null.
 */
export async function checkKey(key: string, init?: ResponseInit): Promise<Response | null>{
    // TODO: fix, for some reason either being skipped/passed over or just not working
    const data = await redis.get(key);
    if(data && typeof data === "string"){
        return new Response(JSON.stringify(JSON.parse(data)), init ? init : undefined);
    }
    return null;
}

/**
 * Sets a value in Redis with an expiration time.
 * The value is stored under the specified key, and the expiration
 * time is set in seconds. If the operation is successful, it returns
 * the value as a Response object.
 * 
 * @param {string} key - The key under which to store the value in Redis.
 * @param {string} value - The value to be stored in Redis.
 * @param {number} ex - The expiration time in seconds.
 * @param {ResponseInit} [init] - Optional response initialization parameters.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the stored value.
 */
export async function setKey(key: string, value: string, ex: number, init?: ResponseInit): Promise<Response>{
    await redis.set(key, value, { ex });
    return new Response(value, init ? init : undefined);
}