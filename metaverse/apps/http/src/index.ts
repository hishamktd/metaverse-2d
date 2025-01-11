import express from "express";
import cors from "cors";
import { router } from "./routes/v1";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3002",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  })
);

app.use(express.json());

app.use("/api/v1", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
