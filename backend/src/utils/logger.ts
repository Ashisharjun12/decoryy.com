import pino from "pino";
import { _config } from "@/config/config.js";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: isDev ? "debug" : "info",
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
        ignore: "pid,hostname",
        singleLine: false,
      },
    },
  }),
});