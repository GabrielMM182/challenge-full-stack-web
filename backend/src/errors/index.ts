
export class AppError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized operation') {
    super(message, 403);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid email or password', 401);
  }
}

export class InvalidPasswordError extends AppError {
  constructor() {
    super('Current password is incorrect', 401);
  }
}
export class ValidationError extends AppError {
  constructor(message: string, public details?: any[]) {
    super(message, 400);
    this.details = details;
  }
}

export class AuthValidationError extends ValidationError {
  constructor(message: string, details?: any[]) {
    super(message, details);
  }
}

export class StudentValidationError extends ValidationError {
  constructor(message: string, details?: any[]) {
    super(message, details);
  }
}

export class UserValidationError extends ValidationError {
  constructor(message: string, details?: any[]) {
    super(message, details);
  }
}
export class NotFoundError extends AppError {
  constructor(resource: string, identifier: string) {
    super(`${resource} with id ${identifier} not found`, 404);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('User', id);
  }
}

export class StudentNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Student', id);
  }
}
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class UserAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`User with email '${email}' already exists`);
  }
}

export class UserConflictError extends ConflictError {
  constructor(field: string, value: string) {
    super(`User with ${field} '${value}' already exists`);
  }
}

export class StudentConflictError extends ConflictError {
  constructor(field: string, value: string) {
    super(`Student with ${field} '${value}' already exists`);
  }
}
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}