const path = require('path');
const { CODES, LEVEL_COLORS, LEVEL_ICONS, LEVEL_LABELS, colorize } = require('./colors');

/**
 * Returns the current time as [HH:MM:SS]
 * @returns {string}
 */
function getTimestamp() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `[${h}:${m}:${s}]`;
}

/**
 * Parses the current call stack to find the caller's file and line number.
 * Skips internal smart-console frames.
 * @returns {string}  e.g. "(server.js:42)"
 */
function getCallerInfo() {
  const stackLines = new Error().stack.split('\n');

  // Walk up the stack until we find a frame that is NOT inside smart-console/src
  for (let i = 2; i < stackLines.length; i++) {
    const line = stackLines[i];

    // Skip internal frames
    if (line.includes('smart-console') && line.includes('src')) continue;
    if (line.includes('node:internal')) continue;

    // Parse "at Object.<anonymous> (C:\path\to\file.js:10:5)"
    const match = line.match(/\((.+):(\d+):\d+\)/) || line.match(/at (.+):(\d+):\d+/);
    if (match) {
      const filePath = match[1];
      const lineNo   = match[2];
      const fileName = path.basename(filePath);
      return `(${fileName}:${lineNo})`;
    }
  }
  return '(unknown)';
}

/**
 * Serializes each argument:
 * - Strings → kept as-is
 * - Objects/Arrays → JSON.stringify with 2-space indent
 * - Others → String()
 * @param {any[]} args
 * @returns {string}
 */
function serializeArgs(args) {
  return args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return `${arg.message}\n${arg.stack}`;
    if (typeof arg === 'object' && arg !== null) {
      try { return JSON.stringify(arg, null, 2); } catch { return String(arg); }
    }
    return String(arg);
  }).join(' ');
}

/**
 * Builds the full formatted log line for terminal output (with ANSI colors).
 *
 * Format:  [HH:MM:SS]  ICON LEVEL  (file.js:line)  message
 *
 * @param {string} level   - log | info | warn | error | debug | success
 * @param {any[]}  args    - original console arguments
 * @param {object} config  - smart-console configuration
 * @returns {string}
 */
function formatLine(level, args, config) {
  const levelColor = LEVEL_COLORS[level] || CODES.white;
  const icon       = LEVEL_ICONS[level]  || '●';
  const label      = LEVEL_LABELS[level] || level.toUpperCase().padEnd(7);
  const message    = serializeArgs(args);

  const parts = [];

  // Timestamp
  if (config.timestamp) {
    parts.push(colorize(getTimestamp(), CODES.gray));
  }

  // Level badge  (icon + label)
  parts.push(colorize(`${icon} ${label}`, levelColor));

  // Caller info
  if (config.callerInfo) {
    parts.push(colorize(getCallerInfo(), CODES.dim + CODES.gray));
  }

  // Message
  parts.push(colorize(message, levelColor));

  return parts.join('  ');
}

/**
 * Builds a plain (no ANSI) log line for writing to log files.
 * @param {string} level
 * @param {any[]}  args
 * @param {object} config
 * @returns {string}
 */
function formatPlainLine(level, args, config) {
  const icon    = LEVEL_ICONS[level]  || '●';
  const label   = LEVEL_LABELS[level] || level.toUpperCase().padEnd(7);
  const message = serializeArgs(args);

  const parts = [];

  if (config.timestamp) parts.push(getTimestamp());

  parts.push(`${icon} ${label}`);

  if (config.callerInfo) parts.push(getCallerInfo());

  parts.push(message);
  return parts.join('  ');
}

module.exports = {
  getTimestamp,
  getCallerInfo,
  serializeArgs,
  formatLine,
  formatPlainLine,
};
