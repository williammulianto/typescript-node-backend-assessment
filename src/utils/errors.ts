export class AppError extends Error {
  status: number;
  errorCode: string;
  message: string;

  constructor(message: string, errorCode: string, status = 400) {
    super(message);
    this.errorCode = errorCode;
    this.message = message;
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errorCode = 'VALIDATION_ERROR') {
    super(message, errorCode, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(message, errorCode, 404);
  }
}
