import { Router } from "express";
import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
} from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parsedData = CreateSpaceSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  const width = Number(parsedData.data.dimensions.split("x")[0]);
  const height = Number(parsedData.data.dimensions.split("x")[1]);
  const creatorId = req.userId!;

  if (!parsedData.data.mapId) {
    try {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width,
          height,
          creatorId,
        },
      });

      res.status(200).json({ id: space.id });

      return;
    } catch (e) {
      console.log("v1/space.ts line => 41 error", e);

      res.status(500).json({ message: "Error creating space" });
      return;
    }
  } else {
    try {
      const map = await client.map.findUnique({
        where: { id: parsedData.data.mapId },
        select: { mapElements: true, width: true, height: true },
      });

      if (!map) {
        res.status(400).json({ message: "Map not found" });
        return;
      }

      const space = await client.$transaction(async () => {
        const space = await client.space.create({
          data: {
            name: parsedData.data.name,
            width: map.width,
            height: map.height,
            creatorId,
          },
        });

        await client.spaceElements.createMany({
          data: map.mapElements.map((element) => ({
            spaceId: space.id,
            elementId: element.elementId,
            x: element.x,
            y: element.y,
          })),
        });

        return space;
      });

      res.status(200).json({ id: space.id });
    } catch (e) {
      console.log("v1/space.ts line => 82 error", e);

      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }
});

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
  const parsedData = DeleteElementSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  try {
    const spaceElement = await client.spaceElements.findUnique({
      where: { id: parsedData.data.id },
      include: { space: true },
    });

    if (!spaceElement) {
      res.status(400).json({ message: "Space element not found" });
      return;
    }

    if (spaceElement.space.creatorId !== req.userId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    } else {
      try {
        await client.spaceElements.delete({
          where: { id: parsedData.data.id },
        });

        res.status(200).json({ message: "Element deleted" });
        return;
      } catch (e) {
        console.log("v1/space.ts line => 264 error", e);

        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }
  } catch (e) {
    console.log("v1/space.ts line => 271 error", e);

    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
  try {
    const space = await client.space.findUnique({
      where: { id: req.params.spaceId },
      select: { creatorId: true },
    });

    if (!space) {
      res.status(400).json({ message: "Space not found" });
      return;
    } else {
      if (space.creatorId !== req.userId) {
        res.status(403).json({ message: "Forbidden" });
        return;
      } else {
        try {
          await client.space.delete({ where: { id: req.params.spaceId } });
          res.status(200).json({ message: "Space deleted" });
        } catch (e) {
          console.log("v1/space.ts line => 109 error", e);

          res.status(500).json({ message: "Internal server error" });
          return;
        }
      }
    }
  } catch (e) {
    console.log("v1/space.ts line => 117 error", e);

    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

spaceRouter.get("/all", userMiddleware, async (req, res) => {
  try {
    const spaces = await client.space.findMany({
      where: { creatorId: req.userId },
    });

    if (!spaces) {
      res.status(400).json({ message: "Spaces not found" });
      return;
    }

    res.status(200).json({
      spaces: spaces.map((space) => ({
        id: space.id,
        name: space.name,
        dimension: `${space.width}x${space.height}`,
        thumbnail: space.thumbnail,
      })),
    });
  } catch (e) {
    console.log("v1/space.ts line => 144 error", e);

    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

spaceRouter.get("/:spaceId", userMiddleware, async (req, res) => {
  try {
    const space = await client.space.findUnique({
      where: { id: req.params.spaceId },
      include: { elements: { include: { element: true } } },
    });

    if (!space) {
      res.status(400).json({ message: "Space not found" });
      return;
    }

    res.status(200).json({
      dimensions: `${space.width}x${space.height}`,
      elements: space.elements?.map((element) => ({
        id: element.id,
        x: element.x,
        y: element.y,
        element: element,
      })),
    });
  } catch (e) {
    console.log("v1/space.ts line => 173 error", e);

    res.status(500).json({ message: "Internal server error" });

    return;
  }
});

spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parsedData = AddElementSchema.safeParse(req.body);

  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: `Validation failed ${parsedData.error.message}` });
    return;
  }

  try {
    const space = await client.space.findUnique({
      where: { id: parsedData.data.spaceId, creatorId: req.userId },
      select: { creatorId: true, width: true, height: true },
    });

    if (
      parsedData?.data.x < 0 ||
      parsedData?.data.y < 0 ||
      parsedData?.data?.x > (space?.width ?? 0) ||
      parsedData?.data?.y > (space?.height ?? 0)
    ) {
      res.status(400).json({ message: "Invalid coordinates" });
      return;
    }

    if (!space) {
      res.status(400).json({ message: "Space not found" });
      return;
    }

    try {
      await client.spaceElements.create({
        data: {
          spaceId: parsedData.data.spaceId,
          elementId: parsedData.data.elementId,
          x: parsedData.data.x,
          y: parsedData.data.y,
        },
      });

      res.status(200).json({ message: "Element added" });
      return;
    } catch (e) {
      console.log("v1/space.ts line => 215 error", e);

      res.status(500).json({ message: "Internal server error" });
      return;
    }
  } catch (e) {
    console.log("v1/space.ts line => 220 error", e);

    res.status(500).json({ message: "Internal server error" });
    return;
  }
});
