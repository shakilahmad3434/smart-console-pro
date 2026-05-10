const fs   = require('fs');
const path = require('path');

/**
 * FileLogger — appends plain-text (no ANSI) log lines to a file.
 * Uses a write stream for performance (no open/close on every log call).
 */
class FileLogger {
  /**
   * @param {string} filePath - absolute or relative path to the log file
   */
  constructor(filePath) {
    this.filePath = path.resolve(filePath);

    // Ensure the parent directory exists
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Open an append write stream
    this.stream = fs.createWriteStream(this.filePath, { flags: 'a', encoding: 'utf8' });

    this.stream.on('error', (err) => {
      process.stderr.write(`[smart-console] FileLogger error: ${err.message}\n`);
    });
  }

  /**
   * Appends a line to the log file.
   * @param {string} line - plain text log line (no ANSI codes)
   */
  write(line) {
    if (this.stream && !this.stream.destroyed) {
      this.stream.write(line + '\n');
    }
  }

  /**
   * Gracefully close the write stream.
   */
  close() {
    if (this.stream && !this.stream.destroyed) {
      this.stream.end();
    }
  }
}

module.exports = FileLogger;
