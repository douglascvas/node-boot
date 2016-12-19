export declare class LoggerFactory {
    private loggerConfig;
    constructor(loggerConfig?: any);
    getLogger(reference: string | Function): Logger;
}
export declare class Logger {
    private _logger;
    constructor(_logger: any);
    log(...args: String[]): void;
    info(...args: String[]): void;
    error(...args: String[]): void;
    warn(...args: String[]): void;
    debug(...args: any[]): void;
    private _toArray(args);
}
