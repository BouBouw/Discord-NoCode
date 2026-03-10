// Custom error classes with error codes for consistent error handling

export class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class LimitExceededError extends AppError {
  constructor(message) {
    super(message, 'LIMIT_EXCEEDED', 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message) {
    super(message, 'DATABASE_ERROR', 500);
  }
}

export class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}
