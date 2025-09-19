// AffordLogger - Custom logging middleware for Affordmed
export interface LogEntry {
  stack: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  package: string;
  message: string;
  meta?: Record<string, any>;
}

class AffordLogger {
  private isEnabled: boolean = true;

  async log(entry: LogEntry): Promise<void> {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    const logData = {
      ...entry,
      timestamp,
      id: Math.random().toString(36).substr(2, 9)
    };

    // In a real implementation, this would send to a logging service
    // For now, we'll store in localStorage only (no console logs per requirement)
    try {
      const existingLogs = JSON.parse(localStorage.getItem('affordLogs') || '[]');
      existingLogs.push(logData);
      
      // Keep only last 1000 logs to prevent localStorage from growing too large
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }
      
      localStorage.setItem('affordLogs', JSON.stringify(existingLogs));
    } catch (error) {
      // Swallow logging errors to avoid breaking the app
    }
  }

  info(packageName: string, message: string, meta?: Record<string, any>): Promise<void> {
    return this.log({
      stack: 'frontend',
      level: 'info',
      package: packageName,
      message,
      meta
    });
  }

  warn(packageName: string, message: string, meta?: Record<string, any>): Promise<void> {
    return this.log({
      stack: 'frontend',
      level: 'warn',
      package: packageName,
      message,
      meta
    });
  }

  error(packageName: string, message: string, meta?: Record<string, any>): Promise<void> {
    return this.log({
      stack: 'frontend',
      level: 'error',
      package: packageName,
      message,
      meta
    });
  }

  debug(packageName: string, message: string, meta?: Record<string, any>): Promise<void> {
    return this.log({
      stack: 'frontend',
      level: 'debug',
      package: packageName,
      message,
      meta
    });
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  getLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('affordLogs') || '[]');
    } catch {
      return [];
    }
  }

  clearLogs(): void {
    localStorage.removeItem('affordLogs');
  }
}

export const logger = new AffordLogger();
