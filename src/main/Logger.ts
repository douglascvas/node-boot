export abstract class Logger {
  abstract log(...args: any[])

  abstract error(...args: any[])

  abstract warn(...args: any[])

  abstract debug(...args: any[])

  abstract info(...args: any[])
}
