import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
  UpdateElementSchema,
} from "../../types";
import client from "@repo/db/client";

export const adminRouter = Router();

adminRouter.post("element", adminMiddleware, async (req, res) => {
  const parsedData = CreateElementSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  try {
    const element = await client.element.create({
      data: {
        imageUrl: parsedData.data.imageUrl,
        width: parsedData.data.width,
        height: parsedData.data.height,
        static: parsedData.data.static,
      },
    });

    res.status(200).json({ id: element.id });
  } catch (e) {
    res.status(500).json({ message: "Error creating element" });
  }
});

adminRouter.put("element/:elementId", adminMiddleware, async (req, res) => {
  const parsedData = UpdateElementSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  try {
    await client.element.update({
      where: { id: req.params.elementId },
      data: {
        imageUrl: parsedData.data.imageUrl,
      },
    });

    res.status(200).json({ message: "Element updated" });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

adminRouter.post("avatar", adminMiddleware, async (req, res) => {
  const parsedData = CreateAvatarSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  try {
    const avatar = await client.avatar.create({
      data: {
        imageUrl: parsedData.data.imageUrl,
        name: parsedData.data.name,
      },
    });

    res.status(200).json({ id: avatar.id });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

adminRouter.post("map", adminMiddleware, async (req, res) => {
  const parsedData = CreateMapSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  const width = Number(parsedData.data.dimensions.split("x")[0]);
  const height = Number(parsedData.data.dimensions.split("x")[1]);

  try {
    const map = await client.map.create({
      data: {
        width,
        height,
        name: parsedData.data.name,
        thumbnail: parsedData.data.thumbnail,
        mapElements: {
          createMany: {
            data: parsedData.data.defaultElements,
          },
        },
      },
    });

    res.status(200).json({ id: map.id });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});
