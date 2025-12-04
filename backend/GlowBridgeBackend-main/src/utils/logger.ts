
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();

    switch (envLogLevel) {
      case "ERROR":
        this.logLevel = LogLevel.ERROR;
        break;
      case "WARN":
        this.logLevel = LogLevel.WARN;
        break;
      case "INFO":
        this.logLevel = LogLevel.INFO;
        break;
      case "DEBUG":
        this.logLevel = LogLevel.DEBUG;
        break;
      default:
        this.logLevel =
          process.env.NODE_ENV === "production"
            ? LogLevel.INFO
            : LogLevel.DEBUG;
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  public error(message: string, context?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage("ERROR", message, context));
    }
  }

  public warn(message: string, context?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("WARN", message, context));
    }
  }

  public info(message: string, context?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage("INFO", message, context));
    }
  }

  public debug(message: string, context?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage("DEBUG", message, context));
    }
  }

  public logDbOperation(
    operation: string,
    table: string,
    duration?: number,
    context?: any
  ): void {
    const message = `DB ${operation} on ${table}${
      duration ? ` (${duration}ms)` : ""
    }`;
    this.debug(message, context);
  }

  public logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: any
  ): void {
    const level = statusCode >= 400 ? "ERROR" : "INFO";
    const message = `${method} ${url} ${statusCode} (${duration}ms)`;

    if (level === "ERROR") {
      this.error(message, context);
    } else {
      this.info(message, context);
    }
  }
}

export const logger = Logger.getInstance();

export const log = {
  error: (message: string, context?: any) => logger.error(message, context),
  warn: (message: string, context?: any) => logger.warn(message, context),
  info: (message: string, context?: any) => logger.info(message, context),
  debug: (message: string, context?: any) => logger.debug(message, context),
  dbOperation: (
    operation: string,
    table: string,
    duration?: number,
    context?: any
  ) => logger.logDbOperation(operation, table, duration, context),
  request: (
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: any
  ) => logger.logRequest(method, url, statusCode, duration, context),
};
