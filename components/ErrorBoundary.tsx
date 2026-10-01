"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI.
 * 
 * It also reports errors to Sentry for monitoring and analysis.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report the error to Sentry
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReportFeedback = () => {
    Sentry.showReportDialog({ eventId: Sentry.lastEventId() });
  };

  private handleResetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise render default error UI
      return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
          <Alert variant="destructive" className="mb-6 max-w-2xl">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <AlertTitle className="ml-2">Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-4 mt-4">
            <Button onClick={this.handleResetError} variant="outline">
              Try again
            </Button>
            <Button onClick={this.handleReportFeedback} variant="default">
              Report feedback
            </Button>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
} 