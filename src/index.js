/**
 * smart-console — A drop-in replacement for Node.js console.
 *
 * Features:
 *  - Timestamps on every log call
 *  - Caller file:line info (auto-detected from stack trace)
 *  - Color-coded log levels (respects NO_COLOR env var)
 *  - Optional persistent file logging (no ANSI in file)
 *  - Silent mode for tests
 *  - New `success()` level
 *  - `configure()` for runtime customization
 *
 * Usage:
 *   const console = require('smart-console');
 *   console.log('Hello');
 *   console.success('Done!');
 *   console.configure({ logFile: './app.log' });
 *
 *   // Global override
 *   global.console = require('smart-console');
 */

'use strict';

const { formatLine, formatPlainLine } = require('./formatter');
const FileLogger = require('./fileLogger');

// ─── Default Configuration ───────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  timestamp:  true,   // Show [HH:MM:SS] prefix
  callerInfo: true,   // Show (file.js:line) caller location
  colors:     true,   // Use ANSI colors (auto-disabled with NO_COLOR env)
  silent:     false,  // Suppress all output (useful in tests)
  logFile:    null,   // File path string to enable file logging, or null
};

// ─── Internal State ───────────────────────────────────────────────────────────

let config     = { ...DEFAULT_CONFIG };
let fileLogger = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Core dispatch: format and write a log entry at the given level.
 * @param {string}  level   - 'log' | 'info' | 'warn' | 'error' | 'debug' | 'success'
 * @param {any[]}   args    - arguments passed by the caller
 */
function dispatch(level, args) {
  if (config.silent) return;

  const effectiveConfig = {
    ...config,
    colors: config.colors && !process.env.NO_COLOR,
  };

  // Terminal output
  const colored = formatLine(level, args, effectiveConfig);
  const writer  = level === 'error' ? process.stderr : process.stdout;
  writer.write(colored + '\n');

  // File output (plain, no ANSI)
  if (fileLogger) {
    const plain = formatPlainLine(level, args, effectiveConfig);
    fileLogger.write(plain);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

const smartConsole = {

  /**
   * Configure smart-console at runtime.
   * @param {Partial<typeof DEFAULT_CONFIG>} options
   */
  configure(options = {}) {
    // If logFile changed, tear down the old FileLogger and create a new one
    if ('logFile' in options && options.logFile !== config.logFile) {
      if (fileLogger) {
        fileLogger.close();
        fileLogger = null;
      }
      if (options.logFile) {
        fileLogger = new FileLogger(options.logFile);
      }
    }

    config = { ...config, ...options };
  },

  /**
   * Returns a copy of the current configuration (read-only snapshot).
   * @returns {object}
   */
  getConfig() {
    return { ...config };
  },

  // ── Standard levels ─────────────────────────────────────────────────────

  /** General-purpose log (white) */
  log(...args)   { dispatch('log',     args); },

  /** Informational message (cyan) */
  info(...args)  { dispatch('info',    args); },

  /** Warning (yellow) */
  warn(...args)  { dispatch('warn',    args); },

  /** Error — written to stderr (red bold) */
  error(...args) { dispatch('error',   args); },

  /** Debug message (magenta) */
  debug(...args) { dispatch('debug',   args); },

  // ── Extra levels ────────────────────────────────────────────────────────

  /** Success confirmation (green) */
  success(...args) { dispatch('success', args); },

  // ── Enhanced table ──────────────────────────────────────────────────────

  /**
   * Logs a formatted table from an array of objects.
   * Falls back to built-in console.table for non-array inputs.
   * @param {any} data
   */
  table(data) {
    if (!config.silent) {
      // Use the native console.table for proper table rendering
      // but prefix it with our timestamp/caller header
      const header = formatLine('info', ['[table]'], config);
      process.stdout.write(header + '\n');
      // Delegate actual table rendering to native console
      // eslint-disable-next-line no-console
      process.stdout.write('\n');
      console.table(data); // intentional native call
    }
  },

  // ── Time helpers (matching native console API) ──────────────────────────

  _timers: {},

  /** Start a named timer. */
  time(label = 'default') {
    this._timers[label] = Date.now();
  },

  /** End a named timer and log the elapsed ms. */
  timeEnd(label = 'default') {
    const start = this._timers[label];
    if (start === undefined) {
      dispatch('warn', [`Timer '${label}' does not exist`]);
      return;
    }
    const elapsed = Date.now() - start;
    delete this._timers[label];
    dispatch('info', [`${label}: ${elapsed}ms`]);
  },

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Close the file logger stream cleanly.
   * Call this before process exit if using logFile.
   */
  close() {
    if (fileLogger) {
      fileLogger.close();
      fileLogger = null;
    }
  },
};

module.exports = smartConsole;
