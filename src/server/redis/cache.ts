import { env } from "@/env";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const cache = {
  ping: async ({ message }: { message?: string }) => {
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
  redis,
};
