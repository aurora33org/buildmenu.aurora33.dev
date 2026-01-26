/**
 * Error handling utilities for consistent error management across the app
 */

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

/**
 * Handles API response errors and extracts error messages
 */
export async function handleApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    
    // Check for validation errors
    if (data.details) {
      const fieldErrors = data.details.fieldErrors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstError = Object.values(fieldErrors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          return String(firstError[0]);
        }
      }
    }
    
    return data.error || data.message || 'Request failed';
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

/**
 * Logs errors to console in development with additional context
 */
export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
}
