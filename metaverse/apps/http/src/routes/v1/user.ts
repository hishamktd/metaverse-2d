import { Router } from "express";
import { UpdateMetaDataSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  const parsedData = UpdateMetaDataSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  try {
    await client.user.update({
      where: { id: req.userId },
      data: { avatarId: parsedData.data.avatarId },
    });

    res.status(200).json({ message: "Metadata updated" });
  } catch (e) {
    console.log("error", e);

    res.status(400).json({ message: "User not found" });
    return;
  }
});

userRouter.get("/metadata/bulk", userMiddleware, async (req, res) => {
  const userIds = (req.query?.ids as string)?.split(",").filter(Boolean);

  try {
    const metadata = await client.user.findMany({
      where: { id: { in: userIds } },
      select: {
        avatar: true,
        id: true,
      },
    });

    res.status(200).json({
      avatars: metadata?.map((m) => ({
        userId: m.id,
        imageUrl: m.avatar?.imageUrl,
      })),
    });

    return;
  } catch (e) {
    console.log("error", e);
    res.status(400).json({ message: "Internal server error" });
    return;
  }
});
