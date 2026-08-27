type ErrorReportingContext = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

/**
 * Reports application errors for logging and debugging purposes.
 * In development, this logs to the console.
 * In production, you can integrate this with error tracking services like Sentry.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // Log to console in development
  if (process.env['NODE_ENV'] === "development") {
    console.error("Application Error:", message, { stack, context, route: window.location.pathname });
  }

  // TODO: Integrate with your preferred error tracking service
  // Example integrations:
  // - Sentry: Sentry.captureException(error, { contexts: { app: context } })
  // - LogRocket: LogRocket.captureException(error)
  // - Custom API: fetch('/api/errors', { method: 'POST', body: JSON.stringify(...) })
}

// Maintain backward compatibility with existing code
export const reportLovableError = reportError;
