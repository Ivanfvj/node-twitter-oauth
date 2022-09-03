import { Logger } from "./";

export class ConsoleLogger implements Logger {
  constructor() {}

  log(message: string, ...optionalParams: any[]): void {
    console.log(message);
  }

  info(message: string, ...optionalParams: any[]): void {
    console.info(message);
  }

  debug(message: string, ...optionalParams: any[]): void {
    console.log(message);
  }

  error(message: string, trace?: any, context?: string): void {
    console.error(message);
  }

  warn(message: string): void {
    console.warn(message);
  }
}
