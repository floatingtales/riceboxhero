import { Redis } from "@upstash/redis";
import { env } from "@/env";

const redis = new Redis({
	url: env.UPSTASH_REDIS_REST_URL,
	token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Cache management utilities for Redis operations
 * @namespace cache
 *
 * @property {Function} ping - Sends a PING command to Redis with an optional message
 * @param {Object} options - Configuration options
 * @param {string} [options.message="hello"] - Message to send with PING command
 * @returns {Promise<string>} Redis PING response
 *
 * @property {Function} testSet - Sets a test key with expiration
 * @param {Object} options - Configuration options
 * @param {string} options.toSet - Value to set for the test key
 * @returns {Promise<boolean>} Success status of the SET operation
 *
 * @property {Function} testGet - Retrieves the test key value
 * @returns {Promise<string | null>} The stored test value or null if not found
 *
 * @property {Function} setAuthorized - Stores JWT authorization token for a user
 * @param {Object} options - Configuration options
 * @param {string} options.id - User ID
 * @param {string} options.jwt - JWT token to store
 * @returns {Promise<boolean>} Success status of the SET operation
 *
 * @property {Function} getAuthorized - Retrieves stored JWT token for a user
 * @param {Object} options - Configuration options
 * @param {string} options.id - User ID
 * @returns {Promise<string | null>} The stored JWT token or null if not found
 *
 * @property {RedisClient} redis - Direct Redis client instance
 */
export const cache = {
	ping: async ({ message = "hello" }: { message?: string } = {}) => {
		return await redis.ping([message]);
	},
	testSet: async ({ toSet }: { toSet: string }) => {
		return await redis.set("test", toSet, { ex: 100 });
	},
	testGet: async () => {
		return await redis.get("test");
	},
	setAuthorized: async ({ id, jwt }: { id: string; jwt: string }) => {
		return await redis.set(`authed:${id}`, jwt);
	},
	getAuthorized: async ({ id }: { id: string }) => {
		return await redis.get(`authed:${id}`);
	},
	deleteAuthorized: async ({ id }: { id: string }) => {
		return await redis.del(`authed:${id}`);
	},
	redis,
};
