import { Router } from "express";
import { UpdateMetaDataSchema } from "../../types";
import client from "@repo/db/client";

export const userRouter = Router();

userRouter.post("/metadata", (req, res) => {
  const parsedData = UpdateMetaDataSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  try {
  } catch (e) {
    console.log("error", e);

    res.status(400).json({ message: "User not found" });
    return;
  }
});

userRouter.post("/metadata/bulk", (req, res) => {
  res.json({ message: "metadata bulk" });
});
