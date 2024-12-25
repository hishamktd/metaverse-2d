import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { SignInSchema, SignUpSchema } from "../../types";
import client from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../config";
import { compare, hash } from "../../scrypt";

export const router = Router();

router.post("/signup", async (req, res) => {
  const parsedData = SignUpSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  const hashedPassword = await hash(parsedData.data.password);

  try {
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
        avatarId: null,
      },
    });

    res.status(201).json({ userId: user.id });

    return;
  } catch (e) {
    console.log("v1/index.ts line => 39 error", e);

    res.status(400).json({ message: "Internal server error" });
    return;
  }
});

router.post("/signin", async (req, res) => {
  const parsedData = SignInSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(403)
      .json({ message: `Validation error ${parsedData.error.message}` });
    return;
  }

  try {
    const user = await client.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });

    if (!user) {
      res.status(403).json({ message: "User does not exist" });
      return;
    }

    const isValid = await compare(parsedData.data.password, user.password);

    if (!isValid) {
      res.status(403).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_PASSWORD);

    res.json({ token });
    return;
  } catch (e) {
    res.status(403).json({ message: "Internal server error" });
    return;
  }
});

router.get("/elements", async (req, res) => {
  try {
    const elements = await client.element.findMany({});
    res.status(200).json({ elements });
  } catch (e) {
    console.log("v1/index.ts line => 90 error", e);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

router.get("/avatar", async (req, res) => {
  try {
    const avatars = await client.avatar.findMany({});

    res.status(200).json({ avatars });
  } catch (e) {
    console.log("v1/index.ts line => 102 error", e);

    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
