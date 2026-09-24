// This file contains all the basic configuration logic for the app server to work
import dotenv from "dotenv";

type ServerConfig = {
  PORT: number;
  REDIS_PORT: number;
  REDIS_HOST: string;
  REDIS_PASSWORD?: string;
  MAIL_USER: string;
  MAIL_PASS: string;
};

function loadEnv() {
  dotenv.config();
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3002,
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "redispassword",
  MAIL_USER: process.env.MAIL_USER || "prajjwalmathur90@gmail.com",
  MAIL_PASS: process.env.MAIL_PASS || "aeyx jdfs luwq jixt",
};
