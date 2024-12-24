import { UserType } from "../constants";
import { NextFunction, Request, Response } from "express";
import verifyToken from "../utils/verify-token";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const decoded = verifyToken(req, res);

  if (decoded) {
    if (decoded.role !== UserType.ADMIN) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    req.userId = decoded.userId;
    next();
  }
};
