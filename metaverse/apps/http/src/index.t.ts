import { UserType } from "./constants";

declare global {
  namespace Express {
    export interface Request {
      role?: UserType;
      userId?: string;
    }
  }
}
