import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../logs');

// Serverless platforms (Vercel, and likely others) mount everything except
// /tmp read-only — mkdirSync here would throw at module load time and crash
// every single route that (transitively) imports this file. Try it, but
// degrade to console-only logging instead of taking the whole app down if
// the filesystem isn't writable.
let fileLoggingEnabled = true;
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  fileLoggingEnabled = false;
  console.warn('⚠️ Log directory is not writable (read-only filesystem?) — logging to console only:', error);
}

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE = path.join(logsDir, process.env.LOG_FILE || 'app.log');

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
};

const formatTime = (): string => {
  return new Date().toISOString();
};

const formatMessage = (level: LogLevel, message: string, data?: any): string => {
  const timestamp = formatTime();
  const levelUpper = level.toUpperCase().padEnd(5);
  
  let output = `[${timestamp}] [${levelUpper}] ${message}`;
  
  if (data) {
    if (typeof data === 'string') {
      output += ` - ${data}`;
    } else if (data instanceof Error) {
      output += `\n${data.stack}`;
    } else {
      output += `\n${JSON.stringify(data, null, 2)}`;
    }
  }
  
  return output;
};

const writeLog = (level: LogLevel, message: string, data?: any): void => {
  const formattedMessage = formatMessage(level, message, data);
  
  // Console output with colors. Always log to console when file logging
  // isn't available (e.g. Vercel's read-only filesystem) — console output
  // is the only thing a serverless platform's runtime logs actually
  // capture, regardless of NODE_ENV.
  if (process.env.NODE_ENV !== 'production' || !fileLoggingEnabled) {
    const color = colors[level];
    console.log(`${color}${formattedMessage}${colors.reset}`);
  }

  // File output
  if (fileLoggingEnabled) {
    try {
      fs.appendFileSync(LOG_FILE, `${formattedMessage}\n`);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
};

export const logger = {
  debug: (message: string, data?: any): void => {
    if (levels[LOG_LEVEL as LogLevel] <= levels.debug) {
      writeLog('debug', message, data);
    }
  },

  info: (message: string, data?: any): void => {
    if (levels[LOG_LEVEL as LogLevel] <= levels.info) {
      writeLog('info', message, data);
    }
  },

  warn: (message: string, data?: any): void => {
    if (levels[LOG_LEVEL as LogLevel] <= levels.warn) {
      writeLog('warn', message, data);
    }
  },

  error: (message: string, data?: any): void => {
    if (levels[LOG_LEVEL as LogLevel] <= levels.error) {
      writeLog('error', message, data);
    }
  },
};

export default logger;
