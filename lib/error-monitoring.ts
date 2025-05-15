"use client";

import * as Sentry from "@sentry/nextjs";

/**
 * Capture an exception and report it to Sentry
 * 
 * @param error - The error object to capture
 * @param context - Additional context to include with the error
 */
export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error captured:', error);
  
  return Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message and report it to Sentry
 * 
 * @param message - The message to capture
 * @param level - The severity level (debug, info, warning, error, fatal)
 * @param context - Additional context to include with the message
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  context?: Record<string, any>
) {
  console.log(`[${level}] ${message}`);
  
  return Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user information for Sentry events
 * 
 * @param user - User information to associate with Sentry events
 */
export function setUser(user: { id?: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user information from Sentry events
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Set extra context data for Sentry events
 * 
 * @param name - The name of the context
 * @param data - The context data
 */
export function setContext(name: string, data: Record<string, any>) {
  Sentry.setContext(name, data);
}

/**
 * Start a new transaction for performance monitoring
 * 
 * @param name - The name of the transaction
 * @param operation - The operation being performed
 */
export function startTransaction(name: string, operation: string) {
  return Sentry.startTransaction({
    name,
    op: operation,
  });
}

/**
 * Create a performance span within a transaction
 * 
 * @param transaction - The parent transaction
 * @param operation - The operation being performed
 * @param description - A description of the span
 */
export function createSpan(transaction: Sentry.Transaction, operation: string, description: string) {
  return transaction.startChild({
    op: operation,
    description,
  });
} 