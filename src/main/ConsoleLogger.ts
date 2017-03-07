import {Logger} from "./Logger";

export class ConsoleLogger implements Logger {
  constructor(private _name) {
  }

  public log(...args: any[]) {
    this._log('info', this._toArray(arguments));
  }

  public error(...args: any[]) {
    this._log('error', this._toArray(arguments));
  }

  public warn(...args: any[]) {
    this._log('warn', this._toArray(arguments));
  }

  public debug(...args: any[]) {
    this._log('debug', this._toArray(arguments));
  }

  public info(...args: any[]) {
    this._log('info', this._toArray(arguments));
  }

  private _toArray(args: IArguments): any[] {
    return Array.prototype.slice.apply(args);
  }

  private _getTime() {
    return new Date().getTime();
  }

  private _formatIdentifier(identifier) {
    return '[' + identifier + '] ';
  }

  private _formatLevel(level) {
    return level.toUpperCase();
  }

  private _levelGetMessageSeparator() {
    return '-';
  }

  private _getMessagePrefix(level: String): String {
    const now = new Date();
    const dateStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    return this._formatLevel(level) + ' ' +
      dateStr + ' ' +
      this._formatIdentifier(this._name) +
      this._levelGetMessageSeparator();
  }

  private _log(level: String, args: any[]) {
    var messagePrefix: String = this._getMessagePrefix('debug');
    var logArgs = Array.prototype.slice.apply(args);
    logArgs.unshift(messagePrefix);
    console.log.apply(console, logArgs);
  }
}
