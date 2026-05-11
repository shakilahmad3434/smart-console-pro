/**
 * smart-console-pro — A drop-in replacement for Node.js console.
 *
 * Features:
 *  - Timestamps on every log call
 *  - Caller file:line info (auto-detected from stack trace)
 *  - Color-coded log levels (respects NO_COLOR env var)
 *  - Optional persistent file logging (no ANSI in file)
 *  - Silent mode for tests
 *  - New `success()` level
 *  - `configure()` for runtime customization
 *  - `child(meta)` for bound sub-loggers with context metadata
 *  - Auto JSON output when NODE_ENV=production (log-aggregator friendly)
 *
 * Usage:
 *   const console = require('smart-console-pro');
 *   console.log('Hello');
 *   console.success('Done!');
 *   console.configure({ logFile: './app.log' });
 *
 *   // Child logger
 *   const reqLog = console.child({ requestId: 'abc-123' });
 *   reqLog.info('Request received');   // includes requestId in every line
 *
 *   // Production JSON mode — set NODE_ENV=production:
 *   // {"level":"info","ts":"2024-01-01T12:00:00.000Z","caller":"app.js:5","msg":"Hello"}
 *
 *   // Global override
 *   global.console = require('smart-console-pro');
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
 * @param {object}  [meta]  - optional bound metadata from a child logger
 */
function dispatch(level, args, meta) {
  if (config.silent) return;

  const writer = level === 'error' ? process.stderr : process.stdout;

  // ── Production mode: emit structured JSON (no ANSI, machine-readable) ──────
  if (process.env.NODE_ENV === 'production') {
    const { getCallerInfo, serializeArgs } = require('./formatter');
    const entry = {
      level,
      ts:     new Date().toISOString(),
      caller: getCallerInfo(),
      msg:    serializeArgs(args),
    };
    if (meta && Object.keys(meta).length > 0) entry.meta = meta;

    const line = JSON.stringify(entry);
    writer.write(line + '\n');

    if (fileLogger) fileLogger.write(line);
    return;
  }

  // ── Dev mode: pretty colored output (default) ────────────────────────────
  const effectiveConfig = {
    ...config,
    colors: config.colors && !process.env.NO_COLOR,
  };

  const colored = formatLine(level, args, effectiveConfig, meta);
  writer.write(colored + '\n');

  // File output (plain, no ANSI)
  if (fileLogger) {
    const plain = formatPlainLine(level, args, effectiveConfig, meta);
    fileLogger.write(plain);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

const smartConsole = {

  /**
   * Configure smart-console-pro at runtime.
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
      const header = formatLine('info', ['[table]'], config);
      process.stdout.write(header + '\n');
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

  // ── Child logger ─────────────────────────────────────────────────────────

  /**
   * Creates a child logger with bound metadata.
   * Every log call on the child automatically includes `meta` in the output.
   * The child shares the parent's live config but cannot modify it.
   *
   * @param {object} meta - key/value pairs to bind to every log line
   * @returns {object} A child logger with the same log-level API
   *
   * @example
   *   const reqLog = console.child({ requestId: 'abc-123', userId: 7 });
   *   reqLog.info('Request received');
   *   reqLog.error('Validation failed', { field: 'email' });
   */
  child(meta = {}) {
    const boundMeta = { ...meta }; // snapshot — mutations don't affect parent

    const childTimers = {};

    return {
      log    (...args) { dispatch('log',     args, boundMeta); },
      info   (...args) { dispatch('info',    args, boundMeta); },
      warn   (...args) { dispatch('warn',    args, boundMeta); },
      error  (...args) { dispatch('error',   args, boundMeta); },
      debug  (...args) { dispatch('debug',   args, boundMeta); },
      success(...args) { dispatch('success', args, boundMeta); },

      table(data) {
        if (!config.silent) {
          const header = formatLine('info', ['[table]'], config, boundMeta);
          process.stdout.write(header + '\n\n');
          console.table(data); // intentional native call
        }
      },

      time(label = 'default') {
        childTimers[label] = Date.now();
      },

      timeEnd(label = 'default') {
        const start = childTimers[label];
        if (start === undefined) {
          dispatch('warn', [`Timer '${label}' does not exist`], boundMeta);
          return;
        }
        const elapsed = Date.now() - start;
        delete childTimers[label];
        dispatch('info', [`${label}: ${elapsed}ms`], boundMeta);
      },
    };
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

