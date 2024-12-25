import { UserType } from "../constants";
import { NextFunction, Request, Response } from "express";
import verifyToken from "../utils/verify-token";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const decoded = verifyToken(req, res);
  console.log("1. decoded", decoded);

  if (decoded) {
    console.log("2. decoded", decoded);

    if (decoded.role !== UserType.ADMIN) {
      console.log("3. decoded", decoded.role, UserType.ADMIN);
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    req.userId = decoded.userId;
    next();
  }
};
