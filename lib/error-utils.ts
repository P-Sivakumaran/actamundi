import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { DatabaseError } from './mongodb';

/**
 * Common error types in the application 
 */
export type AppErrorType = 
  | 'api_error'
  | 'validation_error'
  | 'database_error'
  | 'authentication_error'
  | 'authorization_error'
  | 'not_found'
  | 'bad_request'
  | 'conflict'
  | 'unknown';

/**
 * Standardized application error
 */
export class AppError extends Error {
  type: AppErrorType;
  statusCode: number;
  details?: Record<string, any>;

  constructor(
    message: string, 
    type: AppErrorType = 'unknown', 
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

/**
 * Format error to display to the user
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof DatabaseError) {
    return `Database error: ${error.message}`;
  }
  
  if (error instanceof z.ZodError) {
    const issues = error.errors.map(issue => {
      const path = issue.path.join('.');
      return `${path ? path + ': ' : ''}${issue.message}`;
    });
    return issues.length === 1 
      ? issues[0] 
      : `Validation errors: ${issues.join(', ')}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

/**
 * Handle client-side API errors
 */
export async function handleApiError(response: Response): Promise<AppError> {
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch (e) {
    errorData = { error: 'Failed to parse error response' };
  }
  
  const message = errorData.error || 'API request failed';
  let type: AppErrorType = 'api_error';
  
  switch (response.status) {
    case 400:
      type = 'bad_request';
      break;
    case 401:
      type = 'authentication_error';
      break;
    case 403:
      type = 'authorization_error';
      break;
    case 404:
      type = 'not_found';
      break;
    case 409:
      type = 'conflict';
      break;
    case 422:
      type = 'validation_error';
      break;
  }
  
  return new AppError(message, type, response.status, errorData.details);
}

/**
 * Handle errors for client-side API calls with toast notification
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  {
    onSuccess,
    onError,
    successMessage,
  }: {
    onSuccess?: (data: T) => void | Promise<void>;
    onError?: (error: AppError) => void | Promise<void>;
    successMessage?: string;
  } = {}
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await apiCall();
    
    if (successMessage) {
      toast({
        title: 'Success',
        description: successMessage,
      });
    }
    
    if (onSuccess) {
      await onSuccess(data);
    }
    
    return { data, error: null };
  } catch (e) {
    let error: AppError;
    
    if (e instanceof AppError) {
      error = e;
    } else if (e instanceof Error) {
      error = new AppError(e.message);
    } else {
      error = new AppError('An unknown error occurred');
    }
    
    toast({
      title: 'Error',
      description: formatErrorMessage(error),
      variant: 'destructive',
    });
    
    if (onError) {
      await onError(error);
    }
    
    return { data: null, error };
  }
} 