'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { AppError } from '@/lib/error-utils';

interface ErrorContextType {
  errors: (Error | AppError | string)[];
  addError: (error: Error | AppError | string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [errors, setErrors] = useState<(Error | AppError | string)[]>([]);

  const addError = useCallback((error: Error | AppError | string) => {
    console.error('Error captured:', error);
    setErrors(prev => [...prev, error]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, clearErrors }}>
      {children}
      {errors.length > 0 && <ErrorDisplay errors={errors} onDismiss={clearErrors} />}
    </ErrorContext.Provider>
  );
}

export function useErrors() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrors must be used within an ErrorProvider');
  }
  return context;
} 