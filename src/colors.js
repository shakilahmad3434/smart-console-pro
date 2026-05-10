// ANSI escape codes for terminal colors
// Respects the NO_COLOR environment variable standard: https://no-color.org/

const RESET = '\x1b[0m';

const CODES = {
  reset:   RESET,
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',

  // Foreground colors
  white:   '\x1b[37m',
  cyan:    '\x1b[36m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  magenta: '\x1b[35m',
  green:   '\x1b[32m',
  gray:    '\x1b[90m',
  blue:    '\x1b[34m',
};

// Level → color mapping
const LEVEL_COLORS = {
  log:     CODES.white,
  info:    CODES.cyan,
  warn:    CODES.yellow,
  error:   CODES.red + CODES.bold,
  debug:   CODES.magenta,
  success: CODES.green,
};

// Level → icon mapping (ASCII-safe for file output compatibility on all platforms)
const LEVEL_ICONS = {
  log:     '*',
  info:    'i',
  warn:    '!',
  error:   'X',
  debug:   '#',
  success: '+',
};

// Level → label (padded for alignment)
const LEVEL_LABELS = {
  log:     'LOG    ',
  info:    'INFO   ',
  warn:    'WARN   ',
  error:   'ERROR  ',
  debug:   'DEBUG  ',
  success: 'SUCCESS',
};

/**
 * Wraps text with an ANSI color code.
 * If NO_COLOR is set, returns plain text.
 * @param {string} text
 * @param {string} colorCode - ANSI escape code
 * @returns {string}
 */
function colorize(text, colorCode) {
  if (process.env.NO_COLOR) return text;
  return `${colorCode}${text}${RESET}`;
}

module.exports = {
  CODES,
  LEVEL_COLORS,
  LEVEL_ICONS,
  LEVEL_LABELS,
  colorize,
};
