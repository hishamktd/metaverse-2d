"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "@/hooks/use-session";
import { Space } from "@/types/space";
import api from "@/libs/services/api";
import { WSType } from "@/enum/ws";

type Position = {
  x: number;
  y: number;
  userId: string;
};

const { JOIN, MOVEMENT, SPACE_JOINED, USER_JOINED, USER_LEFT } = WSType;

const AVATAR_SIZE = 30;
const MOVE_SPEED = 5;

export default function SpaceCanvas({ spaceId }: { spaceId: string }) {
  const { token, userId } = useSession();
  const [space, setSpace] = useState<Space | null>(null);
  const [users, setUsers] = useState<Map<string, Position>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await api.get(`/api/v1/space/${spaceId}`);
        const data = await response.data;
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
          type: JOIN,
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
        case SPACE_JOINED:
          const initialUsers = new Map();
          message.payload.users.forEach((user: Position) => {
            initialUsers.set(user.userId, user);
          });
          setUsers(initialUsers);
          break;

        case USER_JOINED:
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

        case USER_LEFT:
          setUsers((prev) => {
            const next = new Map(prev);
            next.delete(message.payload.userId);
            return next;
          });
          break;

        case MOVEMENT:
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

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !userId) return;

    let animationFrameId: number;

    const updatePosition = () => {
      const keys = keysPressed.current;
      let dx = 0;
      let dy = 0;

      if (keys.has("w") || keys.has("arrowup")) dy -= MOVE_SPEED;
      if (keys.has("s") || keys.has("arrowdown")) dy += MOVE_SPEED;
      if (keys.has("a") || keys.has("arrowleft")) dx -= MOVE_SPEED;
      if (keys.has("d") || keys.has("arrowright")) dx += MOVE_SPEED;

      if (dx !== 0 || dy !== 0) {
        handleMovement(dx, dy);
      }
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw all users
      users.forEach((position, id) => {
        ctx.beginPath();
        ctx.arc(position.x, position.y, AVATAR_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = id === userId ? "#4CAF50" : "#2196F3";
        ctx.fill();
        ctx.stroke();

        // Draw user ID above avatar
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          id?.slice(0, 8),
          position.x,
          position.y - AVATAR_SIZE / 2 - 5
        );
      });

      updatePosition();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [userId, users]);

  const handleMovement = (dx: number, dy: number) => {
    if (!wsRef.current || !userId) return;

    const currentPos = users.get(userId) ?? { x: 0, y: 0, userId };
    const newPosition = {
      x: Math.max(
        AVATAR_SIZE,
        Math.min(
          canvasRef.current?.width ?? 800 - AVATAR_SIZE,
          currentPos.x + dx
        )
      ),
      y: Math.max(
        AVATAR_SIZE,
        Math.min(
          canvasRef.current?.height ?? 600 - AVATAR_SIZE,
          currentPos.y + dy
        )
      ),
      userId,
    };

    wsRef.current.send(
      JSON.stringify({
        type: MOVEMENT,
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
    <div className="space-canvas-container">
      <canvas
        ref={canvasRef}
        id="space-canvas"
        width="800"
        height="600"
        className="border border-gray-300 rounded-lg"
      />
      <div className="mt-4 flex gap-2 justify-center">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => handleMovement(-10, 0)}
        >
          Left
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => handleMovement(10, 0)}
        >
          Right
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => handleMovement(0, -10)}
        >
          Up
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => handleMovement(0, 10)}
        >
          Down
        </button>
      </div>
      <div className="mt-2 text-center text-sm text-gray-600">
        Use WASD or arrow keys to move
      </div>
    </div>
  );
}
