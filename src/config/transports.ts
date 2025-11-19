import { existsSync, mkdirSync } from "fs";
import path from "path";
import { transports } from "winston";

const logsDir = path.resolve(process.cwd(), "logs");

if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

export const fileTransports = [
  new transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    handleExceptions: true,
  }),
  new transports.File({
    filename: path.join(logsDir, "combined.log"),
    handleExceptions: true,
  }),
];

export default fileTransports;
