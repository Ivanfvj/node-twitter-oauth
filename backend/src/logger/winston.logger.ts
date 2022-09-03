import * as winston from "winston";
import "winston-daily-rotate-file";
import config from "@src/config";

import { Logger } from "./";

enum LogLevels {
  DEBUG = "debug",
  ERROR = "error",
  INFO = "info",
}

interface WinstonLoggerOptions {
  service: string;
  logDirectory: string;
  infoFileName?: string;
  errorFileName?: string;
  debugFileName?: string;
  logMaxSize?: number | string;
  logMaxFiles?: number | string;
}

const winstonConfig = (
  options?: WinstonLoggerOptions
): winston.LoggerOptions => {
  return {
    defaultMeta: { service: options?.service },
    transports: [
      new winston.transports.DailyRotateFile({
        level: LogLevels.INFO,
        filename: `./logs/${config.environment}/info-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: options?.logMaxSize || "20m",
        maxFiles: options?.logMaxFiles || "14d",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
      new winston.transports.DailyRotateFile({
        level: LogLevels.DEBUG,
        filename: `./logs/${config.environment}/debug-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: options?.logMaxSize || "20m",
        maxFiles: options?.logMaxFiles || "14d",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
      new winston.transports.DailyRotateFile({
        level: LogLevels.ERROR,
        filename: `./logs/${config.environment}/error-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: false,
        maxSize: "20m",
        maxFiles: "30d",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
      new winston.transports.Console({
        level: "debug",
        handleExceptions: true,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({
            format: "DD-MM-YYYY HH:mm:ss",
          }),
          winston.format.simple()
        ),
      }),
    ],
    exitOnError: false,
  };
};

export class WinstonLogger implements Logger {
  private readonly _logger: winston.Logger;

  constructor() {
    // TODO: Add this options from config file and environment variables
    const options: any = {};
    this._logger = winston.createLogger(winstonConfig(options));
    if (process.env.NODE_ENV !== "production") {
      this._logger.debug("Logging initialized at debug level");
    }
  }

  log(message: string, ...optionalParams: any[]): void {
    this._logger.info(message);
  }

  info(message: string, ...optionalParams: any[]): void {
    this._logger.info(message);
  }

  debug(message: string, ...optionalParams: any[]): void {
    this._logger.debug(message);
  }

  error(message: string, trace?: any, context?: string): void {
    this._logger.error(
      `${context || ""} ${message} -> (${trace || "trace not provided !"})`
    );
  }

  warn(message: string): void {
    this._logger.warn(message);
  }
}
