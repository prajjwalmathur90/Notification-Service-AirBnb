import Redis from "ioredis";
import { serverConfig } from ".";

function connectRedis() {
  try {
    let connection: Redis;

    const redisConfig: any = {
      port: serverConfig.REDIS_PORT,
      host: serverConfig.REDIS_HOST,
      maxRetriesPerRequest: null,
    };

    if (serverConfig.REDIS_PASSWORD) {
      redisConfig.password = serverConfig.REDIS_PASSWORD;
    }

    return () => {
      if (!connection) {
        connection = new Redis(redisConfig);
        return connection;
      }

      return connection;
    };
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    throw error;
  }
}

export const getRedisConnectionObj = connectRedis();
