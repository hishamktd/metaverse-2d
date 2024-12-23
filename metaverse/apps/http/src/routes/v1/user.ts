import { Router } from "express";

export const userRouter = Router();

userRouter.post("/metadata", (req, res) => {
  res.json({ message: "metadata" });
});

userRouter.post("/metadata/bulk", (req, res) => {
  res.json({ message: "metadata bulk" });
});
