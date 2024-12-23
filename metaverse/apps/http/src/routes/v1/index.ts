import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { SignUpSchema } from "../../types";
import client from "@repo/db/client";

export const router = Router();

router.post("/signup", async (req, res) => {
  const parsedData = SignUpSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: `Validation error ${parsedData.error}` });
    return;
  }
  try {
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: parsedData.data.password,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });

    res.status(201).json({ userId: user.id });

    return;
  } catch (e) {
    res.status(400).json({ message: "User already exists" });
    return;
  }
});

router.post("/signin", (req, res) => {
  res.json({ message: "signin" });
});

router.get("/elements", (req, res) => {
  res.json({ message: "elements" });
});

router.get("/avatar", (req, res) => {
  res.json({ message: "avatar" });
});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
