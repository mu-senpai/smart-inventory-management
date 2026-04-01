import { NextFunction, Request, Response } from "express";
import { tenantContext } from "../utils/tenantContext";
import { ApiError } from "../utils/ApiError";

export const tenantMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user || !req.user.userId) {
    return next(ApiError.unauthorized("Authentication required to determine tenant"));
  }

  // Use the user's ID as the tenant identifier (for now, ignoring managers)
  const tenantId = req.user.userId;

  tenantContext.run(tenantId, () => {
    next();
  });
};
