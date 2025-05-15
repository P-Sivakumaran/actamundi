'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, XCircle } from 'lucide-react';
import { AppError } from '@/lib/error-utils';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  errors: (Error | AppError | string)[];
  onDismiss?: () => void;
}

export function ErrorDisplay({ errors, onDismiss }: ErrorDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [isDev, setIsDev] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);
  
  if (!mounted || !errors || errors.length === 0) return null;
  
  const formatError = (error: Error | AppError | string) => {
    if (typeof error === 'string') return error;
    return error.message || 'Unknown error';
  };
  
  // In production, we show a simpler, more user-friendly message
  if (!isDev) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-400 dark:border-red-700 overflow-hidden">
        <div className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white">
              {errors.length === 1 ? 'An issue occurred' : `${errors.length} issues occurred`}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              Please try again. If the problem persists, please contact support.
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white" 
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    );
  }
  
  // In development, we show more detailed error information
  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-400 dark:border-red-700 overflow-hidden">
      <div className="bg-red-100 dark:bg-red-900/30 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
          <h3 className="font-medium text-sm text-red-800 dark:text-red-300">
            {errors.length} {errors.length === 1 ? 'error' : 'errors'}
          </h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300" 
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
      <div className="p-2">
        <ul className="text-xs space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="px-2 py-1.5 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300">
              {formatError(error)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 