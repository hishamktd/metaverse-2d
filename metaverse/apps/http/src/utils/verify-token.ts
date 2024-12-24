import { Request, Response } from "express";
import { JWT_PASSWORD } from "../config";
import jwt from "jsonwebtoken";

const verifyToken = (req: Request, res: Response) => {
  const bearerToken = req.headers.authorization;
  const token = bearerToken?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  try {
    return jwt.verify(token, JWT_PASSWORD) as { role: string; userId: string };
  } catch {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
};

export default verifyToken;
