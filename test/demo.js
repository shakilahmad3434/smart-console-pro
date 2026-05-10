/**
 * smart-console — Demo / Visual Test
 * Run: node test/demo.js
 */

const console = require('../src/index');

// ── Basic usage with defaults ────────────────────────────────────────────────
console.log('This is a regular log message');
console.info('Server is listening on port 3000');
console.warn('Memory usage is above 80%');
console.error('Failed to connect to database');
console.debug('Request payload:', { userId: 42, action: 'login' });
console.success('User authenticated successfully!');

// ── Separator ────────────────────────────────────────────────────────────────
process.stdout.write('\n');

// ── Logging an object ───────────────────────────────────────────────────────
console.info('User object:', { name: 'Ravi', role: 'admin', active: true });

// ── Logging an error object ──────────────────────────────────────────────────
const err = new Error('Something went wrong');
console.error(err);

process.stdout.write('\n');

// ── Timer demo ───────────────────────────────────────────────────────────────
console.time('fetchData');
setTimeout(() => {
  console.timeEnd('fetchData');
}, 120);

// ── File logging ─────────────────────────────────────────────────────────────
console.configure({ logFile: './test/output.log' });
console.info('This line is also written to test/output.log');
console.success('File logging is working!');

// ── Silent mode demo ─────────────────────────────────────────────────────────
process.stdout.write('\n');
console.configure({ silent: true });
console.log('You should NOT see this line (silent mode)');
console.configure({ silent: false });
console.success('Silent mode ended — you can see this!');

// ── Disable timestamps and caller info ───────────────────────────────────────
process.stdout.write('\n');
console.configure({ timestamp: false, callerInfo: false });
console.info('Minimal mode: no timestamp, no caller info');
console.configure({ timestamp: true, callerInfo: true });

// ── Global override demo (uncomment to test) ─────────────────────────────────
// global.console = require('../src/index');
// console.log('This uses smart-console as global console!');

// Close file logger cleanly
setTimeout(() => {
  console.close();
  process.stdout.write('\n✅  Demo complete. Check test/output.log for file output.\n\n');
}, 200);
