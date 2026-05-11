export interface SmartConsoleConfig {
  /** Show [HH:MM:SS] prefix. Default: true */
  timestamp?: boolean;
  /** Show (file.js:line) caller location. Default: true */
  callerInfo?: boolean;
  /** Use ANSI colors (auto-disabled with NO_COLOR env). Default: true */
  colors?: boolean;
  /** Suppress all output (useful in tests). Default: false */
  silent?: boolean;
  /** File path string to enable file logging, or null. Default: null */
  logFile?: string | null;
}

export interface ChildLogger {
  log(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
  success(...args: any[]): void;
  table(data: any): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
}

export interface SmartConsole extends ChildLogger {
  /**
   * Configure smart-console-pro at runtime.
   */
  configure(options?: Partial<SmartConsoleConfig>): void;
  /**
   * Returns a copy of the current configuration (read-only snapshot).
   */
  getConfig(): SmartConsoleConfig;
  /**
   * Creates a child logger with bound metadata.
   * Every log call on the child automatically includes `meta` in the output.
   * The child shares the parent's live config but cannot modify it.
   *
   * @param meta - key/value pairs to bind to every log line
   */
  child(meta?: Record<string, any>): ChildLogger;
  /**
   * Close the file logger stream cleanly.
   * Call this before process exit if using logFile.
   */
  close(): void;
}

declare const smartConsole: SmartConsole;

export default smartConsole;

export const log: SmartConsole['log'];
export const info: SmartConsole['info'];
export const warn: SmartConsole['warn'];
export const error: SmartConsole['error'];
export const debug: SmartConsole['debug'];
export const success: SmartConsole['success'];
export const configure: SmartConsole['configure'];
export const getConfig: SmartConsole['getConfig'];
export const child: SmartConsole['child'];
export const time: SmartConsole['time'];
export const timeEnd: SmartConsole['timeEnd'];
export const table: SmartConsole['table'];
export const close: SmartConsole['close'];
