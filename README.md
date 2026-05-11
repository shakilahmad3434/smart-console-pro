# smart-console-pro 🧠

> A drop-in replacement for Node.js `console` — with timestamps, caller info, color-coded levels, file logging, child loggers, and more.

[![npm version](https://img.shields.io/npm/v/smart-console-pro.svg)](https://www.npmjs.com/package/smart-console-pro)
[![license](https://img.shields.io/npm/l/smart-console-pro.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/smart-console-pro.svg)](https://nodejs.org)

---

## ✨ Features

| Feature               | Description                                      |
| --------------------- | ------------------------------------------------ |
| 🕐 Timestamps         | `[HH:MM:SS]` prefix on every log                 |
| 📍 Caller Info        | Auto-detects `filename:line` from the call stack |
| 🎨 Color-coded Levels | Each level has a distinct color                  |
| 📁 File Logging       | Optionally write plain logs to a `.log` file     |
| 👶 Child Loggers      | Bind metadata (e.g., `requestId`) to logs        |
| 🚀 Production JSON    | Auto JSON output when `NODE_ENV=production`      |
| 📦 Dual ESM/CJS       | Works natively with `import` and `require()`     |
| 💙 TypeScript         | Fully typed out-of-the-box (`index.d.ts`)        |
| 🔇 Silent Mode        | Suppress all output — great for tests            |
| ⚙️ Configurable       | `configure()` for runtime customization          |
| 🔌 Drop-in            | `global.console = require('smart-console-pro')`  |
| 🪶 Zero dependencies  | Uses only Node.js built-ins                      |

---

## 📦 Installation

```bash
npm install smart-console-pro
```

---

## 🚀 Quick Start

**ESM (import)**
```js
import log from 'smart-console-pro';
// or named exports:
// import { info, warn, success } from 'smart-console-pro';

log.info("Listening on port 3000");
log.success("User authenticated!");
```

**CommonJS (require)**
```js
const console = require("smart-console-pro");

console.log("Server started");
console.error("Database connection failed");
```

**Output:**

```
[15:30:01]  ● LOG     (server.js:3)    Server started
[15:30:01]  ℹ INFO    (server.js:4)    Listening on port 3000
[15:30:01]  ✖ ERROR   (server.js:6)    Database connection failed
[15:30:01]  ✔ SUCCESS (server.js:8)    User authenticated!
```

---

## 👶 Child Loggers

You can create a child logger to automatically bind context (like a `requestId` or `userId`) to all logs produced by that logger.

```js
import log from 'smart-console-pro';

const reqLog = log.child({ requestId: 'abc-123', userId: 42 });

reqLog.info('Processing request...');
// [15:30:01]  ℹ INFO    (app.js:5)  Processing request...  {"requestId":"abc-123","userId":42}

reqLog.error('Validation failed');
// [15:30:01]  ✖ ERROR   (app.js:8)  Validation failed  {"requestId":"abc-123","userId":42}
```

---

## 🚀 Production JSON Mode

When you deploy your app to production, you likely want structured logs for aggregators (like Datadog, CloudWatch, or ELK).

`smart-console-pro` automatically detects when `NODE_ENV=production` and switches from pretty colored output to **machine-readable JSON lines**.

```bash
# In your terminal
export NODE_ENV=production
node server.js
```

**Output:**
```json
{"level":"info","ts":"2026-05-11T12:00:00.000Z","caller":"server.js:10","msg":"Server started"}
{"level":"error","ts":"2026-05-11T12:00:01.000Z","caller":"db.js:42","msg":"Query failed","meta":{"requestId":"abc-123"}}
```
> *Dev mode (default) remains pretty and colored.*

---

## ⚙️ Configuration

```js
const console = require("smart-console-pro");

console.configure({
    timestamp: true, // Show [HH:MM:SS] — default: true
    callerInfo: true, // Show (file.js:line) — default: true
    colors: true, // ANSI colors — default: true
    silent: false, // Suppress all output — default: false
    logFile: "./app.log", // Write to file — default: null (disabled)
});
```

> Set `NO_COLOR=1` environment variable to globally disable colors (follows [no-color.org](https://no-color.org)).

---

## 📁 File Logging

```js
console.configure({ logFile: "./logs/app.log" });

console.info("This appears in terminal AND in app.log");
console.error("Errors too!");

// Gracefully close the stream before exit
console.close();
```

The log file contains **plain text only** (no ANSI codes).

---

## ⏱️ Timer

```js
console.time("fetchData");

// ... async work ...

console.timeEnd("fetchData");
// [15:30:02]  ℹ INFO    (app.js:10)    fetchData: 120ms
```

---

## 🌍 Global Override

Replace the built-in console everywhere with a single line:

```js
global.console = require("smart-console-pro");

// All console.log, console.error, etc. in your entire app are now enhanced
console.log("I am now smart!");
```

---

## 🆚 Comparison

| Feature | `smart-console-pro` | Native `console` | `winston` / `pino` |
|---------|---------------------|------------------|--------------------|
| **Setup required** | None (Drop-in) | None | High (Boilerplate) |
| **Colors & Formatting** | ✅ Built-in | ❌ No | ✅ Requires plugins |
| **Caller Info (File:Line)** | ✅ Auto-detected | ❌ No | ⚠️ Complex to setup |
| **Child Loggers** | ✅ Yes (`.child()`) | ❌ No | ✅ Yes |
| **Production JSON** | ✅ Auto-detects | ❌ No | ✅ Yes |
| **Bundle Size / Deps** | **0 dependencies** | Built-in | Heavy |

---

## 📋 API Reference

| Method                       | Description                     |
| ---------------------------- | ------------------------------- |
| `log(...args)`               | General log (white)             |
| `info(...args)`              | Informational (cyan)            |
| `warn(...args)`              | Warning (yellow)                |
| `error(...args)`             | Error → stderr (red bold)       |
| `debug(...args)`             | Debug (magenta)                 |
| `success(...args)`           | Success (green)                 |
| `child(meta)`                | Create bound sub-logger ✨      |
| `time(label)`                | Start a timer                   |
| `timeEnd(label)`             | End a timer and log elapsed ms  |
| `configure(options)`         | Update configuration at runtime |
| `getConfig()`                | Get current config snapshot     |
| `close()`                    | Close file logger stream        |

---

## 📄 License

MIT © [Shakil Ahmad](https://github.com/shakilahmad3434)
