// Custom error classes
export class DatabaseError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error codes
export const ErrorCodes = {
  NOT_FOUND: 'not_found',
  ALREADY_EXISTS: 'already_exists',
  PERMISSION_DENIED: 'permission_denied',
  INVALID_DATA: 'invalid_data',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

// Error messages
export const ErrorMessages = {
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
  [ErrorCodes.ALREADY_EXISTS]: 'The resource already exists',
  [ErrorCodes.PERMISSION_DENIED]: 'You do not have permission to perform this action',
  [ErrorCodes.INVALID_DATA]: 'The provided data is invalid',
  [ErrorCodes.NETWORK_ERROR]: 'A network error occurred',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred',
} as const;

// Helper function to handle Firebase errors
export function handleFirebaseError(error: any): DatabaseError {
  console.error('Firebase Error:', error);

  // Map Firebase error codes to our custom error codes
  switch (error.code) {
    case 'permission-denied':
      return new DatabaseError(ErrorMessages.PERMISSION_DENIED, ErrorCodes.PERMISSION_DENIED, error);
    case 'not-found':
      return new DatabaseError(ErrorMessages.NOT_FOUND, ErrorCodes.NOT_FOUND, error);
    case 'already-exists':
      return new DatabaseError(ErrorMessages.ALREADY_EXISTS, ErrorCodes.ALREADY_EXISTS, error);
    default:
      return new DatabaseError(ErrorMessages.UNKNOWN_ERROR, ErrorCodes.UNKNOWN_ERROR, error);
  }
} 