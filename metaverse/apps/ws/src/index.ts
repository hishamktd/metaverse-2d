import { WebSocketServer } from "ws";
import { User } from "./User";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
  let user: User | null = null;
  ws.on("error", (error) => {
    console.log("WebSocket error:", error);
  });

  ws.on("message", (data) => {
    user = new User(ws);
  });

  ws.on("close", () => {
    user?.onDestroy();
  });
});
