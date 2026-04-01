import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error values
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Internal server error";
  let errors: any[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation failed";
    errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (
    (err as any).code === 11000 &&
    (err as any).keyPattern
  ) {
    statusCode = StatusCodes.CONFLICT;
    const field = Object.keys((err as any).keyPattern)[0];
    message = `Duplicate value for field: ${field}`;
  }

  if (env.NODE_ENV === "development") {
    console.error("🔥 Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
