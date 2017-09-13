import {AutoScanOptions} from "./core/autoScanner/AutoScanOptions";

export class ApplicationConfig {
  private _autoScanOptions: AutoScanOptions;
  private _autoScanEnabled: boolean;

  public enableAutoScan(include: string | string[], exclude?: string | string[]): ApplicationConfig {
    if (typeof include === 'string') {
      include = [include];
    }
    if (typeof exclude === 'string') {
      exclude = [exclude];
    }
    this._autoScanOptions = {
      include: include,
      exclude: exclude
    };
    this._autoScanEnabled = true;
    return this;
  }

  get autoScanOptions(): AutoScanOptions {
    return this._autoScanOptions;
  }

  get autoScanEnabled(): boolean {
    return this._autoScanEnabled;
  }
}