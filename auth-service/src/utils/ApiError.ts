export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  validationErrors?: ValidationErrorItem[] | undefined;

  constructor(
    statusCode: number,
    message: string,
    validationErrors?: ValidationErrorItem[] | undefined,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.validationErrors = validationErrors;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static validation(message: string, errors: ValidationErrorItem[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static notFound(message: string = "Not Found"): ApiError {
    return new ApiError(404, message);
  }

  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static internal(message: string = "Internal Server Error"): ApiError {
    return new ApiError(500, message);
  }
}
