import { useEffect, useState, useRef } from "react";
import { useSession } from "@/hooks/use-session";
import { Space } from "@/types/space";

interface Position {
  x: number;
  y: number;
  userId: string;
}

export default function SpaceCanvas({ spaceId }: { spaceId: string }) {
  const { token, userId } = useSession();
  const [space, setSpace] = useState<Space | null>(null);
  const [users, setUsers] = useState<Map<string, Position>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await fetch(`/api/v1/space/${spaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setSpace(data);
      } catch (error) {
        console.error("Failed to fetch space:", error);
      }
    };

    if (token) {
      fetchSpace();
    }
  }, [spaceId, token]);

  useEffect(() => {
    if (!token || !userId || !space) return;

    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            spaceId,
            token,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "space-joined":
          const initialUsers = new Map();
          message.payload.users.forEach((user: Position) => {
            initialUsers.set(user.userId, user);
          });
          setUsers(initialUsers);
          break;

        case "user-joined":
          setUsers((prev) => {
            const next = new Map(prev);
            next.set(message.payload.userId, {
              userId: message.payload.userId,
              x: message.payload.spawn.x,
              y: message.payload.spawn.y,
            });
            return next;
          });
          break;

        case "user-left":
          setUsers((prev) => {
            const next = new Map(prev);
            next.delete(message.payload.userId);
            return next;
          });
          break;

        case "movement":
          setUsers((prev) => {
            const next = new Map(prev);
            next.set(message.payload.userId, {
              userId: message.payload.userId,
              x: message.payload.x,
              y: message.payload.y,
            });
            return next;
          });
          break;

        default:
          console.warn("Unhandled message type:", message.type);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [token, userId, space, spaceId]);

  const handleMovement = (dx: number, dy: number) => {
    if (!wsRef.current || !userId) return;

    const newPosition = {
      x: users.get(userId)?.x ?? 0 + dx,
      y: users.get(userId)?.y ?? 0 + dy,
      userId,
    };

    wsRef.current.send(
      JSON.stringify({
        type: "movement",
        payload: newPosition,
      })
    );

    setUsers((prev) => {
      const next = new Map(prev);
      next.set(userId, newPosition);
      return next;
    });
  };

  return (
    <div>
      <canvas id="space-canvas" width="800" height="600" />
      <button onClick={() => handleMovement(-10, 0)}>Left</button>
      <button onClick={() => handleMovement(10, 0)}>Right</button>
      <button onClick={() => handleMovement(0, -10)}>Up</button>
      <button onClick={() => handleMovement(0, 10)}>Down</button>
    </div>
  );
}
