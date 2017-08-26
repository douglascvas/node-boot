import {Logger} from "./Logger";

export class ConsoleLogger implements Logger {
  constructor(private _name) {
  }

  public log(...args: any[]) {
    this.performLogging('info', this.toArray(arguments));
  }

  public error(...args: any[]) {
    this.performLogging('error', this.toArray(arguments));
  }

  public warn(...args: any[]) {
    this.performLogging('warn', this.toArray(arguments));
  }

  public debug(...args: any[]) {
    this.performLogging('debug', this.toArray(arguments));
  }

  public info(...args: any[]) {
    this.performLogging('info', this.toArray(arguments));
  }

  private toArray(args: IArguments): any[] {
    return Array.prototype.slice.apply(args);
  }

  private getTime() {
    return new Date().getTime();
  }

  private formatIdentifier(identifier) {
    return '[' + identifier + '] ';
  }

  private formatLevel(level) {
    return level.toUpperCase();
  }

  private levelGetMessageSeparator() {
    return '-';
  }

  private getMessagePrefix(level: String): String {
    const now = new Date();
    const dateStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    return this.formatLevel(level) + ' ' +
      dateStr + ' ' +
      this.formatIdentifier(this._name) +
      this.levelGetMessageSeparator();
  }

  private performLogging(level: String, args: any[]) {
    const messagePrefix: String = this.getMessagePrefix('debug');
    const logArgs = Array.prototype.slice.apply(args);
    logArgs.unshift(messagePrefix);
    console.log.apply(console, logArgs);
  }
}