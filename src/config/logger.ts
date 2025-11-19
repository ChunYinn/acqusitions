import { createLogger, format, transports } from "winston";
import fileTransports from "./transports";

const level = process.env.LOG_LEVEL ?? "info";
const nodeEnv = process.env.NODE_ENV ?? "development";

const logger = createLogger({
  level,
  defaultMeta: {
    service: "acquisition-api",
  },
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json()
  ),
  transports: [...fileTransports],
  exitOnError: false,
});

if (nodeEnv !== "production") {
  logger.add(
    new transports.Console({
      handleExceptions: true,
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export { logger };
export default logger;
