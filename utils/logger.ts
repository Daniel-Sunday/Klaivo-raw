import { AsyncLocalStorage } from 'async_hooks';

export interface LoggerContext {
  traceId?: string;
  sessionId?: string;
  learnerId?: string;
  agent?: string;
  [key: string]: any;
}

const asyncLocalStorage = new AsyncLocalStorage<LoggerContext>();

export function runWithTraceContext<T>(context: LoggerContext, fn: () => Promise<T>): Promise<T> {
  const current = asyncLocalStorage.getStore() || {};
  const mergedContext = { ...current, ...context };
  return asyncLocalStorage.run(mergedContext, fn);
}

export function getTraceContext(): LoggerContext {
  return asyncLocalStorage.getStore() || {};
}

export function generateTraceId(): string {
  return `tr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

class ContextLogger {
  private formatLog(level: 'info' | 'warn' | 'error' | 'debug', messageOrData: any, optionalMessage?: string) {
    const store = getTraceContext();
    const timestamp = new Date().toISOString();
    
    let payload: Record<string, any> = {
      timestamp,
      level: level.toUpperCase(),
      ...store,
    };

    if (typeof messageOrData === 'string') {
      payload.message = messageOrData;
    } else if (typeof messageOrData === 'object' && messageOrData !== null) {
      payload = { ...payload, ...messageOrData };
      if (optionalMessage) {
        payload.message = optionalMessage;
      }
    } else {
      payload.message = String(messageOrData);
    }

    const output = JSON.stringify(payload);
    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  public info(data: any, msg?: string) {
    this.formatLog('info', data, msg);
  }

  public warn(data: any, msg?: string) {
    this.formatLog('warn', data, msg);
  }

  public error(data: any, msg?: string) {
    this.formatLog('error', data, msg);
  }

  public debug(data: any, msg?: string) {
    this.formatLog('debug', data, msg);
  }
}

export const logger = new ContextLogger();
