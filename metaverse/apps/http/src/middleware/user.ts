import { UserType } from "../constants";
import { NextFunction, Request, Response } from "express";
import verifyToken from "../utils/verify-token";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const decoded = verifyToken(req, res);

  if (decoded) {
    req.userId = decoded.userId;
    next();
  }
};
