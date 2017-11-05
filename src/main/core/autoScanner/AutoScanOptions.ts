export interface AutoScanOptions {
  enabled: boolean,
  include: string | (string[]),
  exclude?: string | (string[])
}