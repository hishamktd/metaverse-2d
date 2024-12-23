import { Router } from "express";

export const adminRouter = Router();

adminRouter.post("element", (req, res) => {
  res.json({ message: "elements" });
});

adminRouter.put("element/:elementId", (req, res) => {
  res.json({ message: "element" });
});

adminRouter.post("space", (req, res) => {
  res.json({ message: "space" });
});

adminRouter.post("/map", (req, res) => {
  res.json({ message: "map" });
});
