/**
 * ESM entry point for smart-console-pro.
 *
 * Uses Node.js built-in `createRequire` to load the CJS core — zero new deps.
 * The CJS `src/` is the single source of truth; this file is a thin re-export.
 *
 * Usage:
 *   import log from 'smart-console-pro';
 *   import { info, warn, child } from 'smart-console-pro';
 */

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('../index.d.ts').SmartConsole} */
const smartConsole = require('../src/index.js');

export default smartConsole;

export const {
  log,
  info,
  warn,
  error,
  debug,
  success,
  configure,
  getConfig,
  close,
  child,
  time,
  timeEnd,
  table,
} = smartConsole;
