import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string) {
    return new ApiError(StatusCodes.BAD_REQUEST, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(StatusCodes.UNAUTHORIZED, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(StatusCodes.FORBIDDEN, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(StatusCodes.NOT_FOUND, message);
  }

  static conflict(message: string) {
    return new ApiError(StatusCodes.CONFLICT, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message, false);
  }
}
