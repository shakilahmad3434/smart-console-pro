# smart-console-pro 🧠

> A drop-in replacement for Node.js `console` — with timestamps, caller info, color-coded levels, file logging, and more.

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

```js
const console = require("smart-console-pro");

console.log("Server started");
console.info("Listening on port 3000");
console.warn("Memory usage is high");
console.error("Database connection failed");
console.debug("Request payload:", { id: 1 });
console.success("User authenticated!");
```

**Output:**

```
[15:30:01]  ● LOG     (server.js:3)    Server started
[15:30:01]  ℹ INFO    (server.js:4)    Listening on port 3000
[15:30:01]  ⚠ WARN    (server.js:5)    Memory usage is high
[15:30:01]  ✖ ERROR   (server.js:6)    Database connection failed
[15:30:01]  ◆ DEBUG   (server.js:7)    Request payload: { "id": 1 }
[15:30:01]  ✔ SUCCESS (server.js:8)    User authenticated!
```

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

## 🔇 Silent Mode (for tests)

```js
const console = require("smart-console-pro");

beforeAll(() => console.configure({ silent: true }));
afterAll(() => console.configure({ silent: false }));
```

---

## 📋 API Reference

| Method                       | Description                     |
| ---------------------------- | ------------------------------- |
| `console.log(...args)`       | General log (white)             |
| `console.info(...args)`      | Informational (cyan)            |
| `console.warn(...args)`      | Warning (yellow)                |
| `console.error(...args)`     | Error → stderr (red bold)       |
| `console.debug(...args)`     | Debug (magenta)                 |
| `console.success(...args)`   | Success (green) ✨ new          |
| `console.time(label)`        | Start a timer                   |
| `console.timeEnd(label)`     | End a timer and log elapsed ms  |
| `console.configure(options)` | Update configuration at runtime |
| `console.getConfig()`        | Get current config snapshot     |
| `console.close()`            | Close file logger stream        |

---

## 📄 License

MIT © [Shakil Ahmad](https://github.com/shakilahmad3434)
