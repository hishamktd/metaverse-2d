import { WebSocket } from "ws";
import { WSType } from "./enum";
import { RoomManger } from "./RoomManger";
import { OutGoingMessage } from "./types";
import client from "@repo/db/client";
import jsw, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

const getRandomString = () => Math.random().toString(36).substring(2, 9);

const {
  JOIN,
  MOVE,
  SPACE_JOINED,
  MOVEMENT_REJECTED,
  USER_JOINED,
  USER_LEFT,
  MOVEMENT,
} = WSType;

export class User {
  public id: string;
  public userId?: string;
  private spaceId?: string;
  private x: number;
  private y: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.id = getRandomString();
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.initHandlers();
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      const parsedData = JSON.parse(data.toString());

      switch (parsedData.type) {
        case JOIN:
          const spaceId = parsedData.payload.spaceId;
          const token = parsedData.payload.token;

          const userId = (jsw.verify(token, JWT_PASSWORD) as JwtPayload).userId;

          if (!userId) {
            this.ws.close();
            return;
          }

          this.userId = userId;

          const space = await client.space.findFirst({
            where: { id: spaceId },
          });

          if (!space) {
            this.ws.close();
            return;
          }

          this.spaceId = spaceId;
          this.x = Math.floor(Math.random() * space.width);
          this.y = Math.floor(Math.random() * space.height);

          RoomManger.getInstance().addUser(spaceId, this);

          this.send({
            type: SPACE_JOINED,
            payload: {
              spawn: {
                x: this.x,
                y: this.y,
              },
              users:
                RoomManger.getInstance()
                  .room.get(spaceId)
                  ?.filter((x) => x.id !== this.id)
                  ?.map((u) => ({ id: u.id })) ?? [],
            },
          });

          RoomManger.getInstance().broadCast(
            {
              type: USER_JOINED,
              payload: {
                userId: this.userId,
                spawn: {
                  x: this.x,
                  y: this.y,
                },
              },
            },
            this,
            this.spaceId!
          );

          break;

        case MOVE:
          const moveX = parsedData.payload.x;
          const moveY = parsedData.payload.y;

          const xDis = Math.abs(this.x - moveX);
          const yDis = Math.abs(this.y - moveY);

          if ((xDis === 1 && yDis === 0) || (xDis === 0 && yDis === 1)) {
            this.x = moveX;
            this.y = moveY;

            RoomManger.getInstance().broadCast(
              {
                type: MOVEMENT,
                payload: {
                  x: this.x,
                  y: this.y,
                  userId: this.id,
                },
              },
              this,
              this.spaceId!
            );

            return;
          } else {
            this.send({
              type: MOVEMENT_REJECTED,
              payload: {
                x: this.x,
                y: this.y,
              },
            });
          }

          break;
      }
    });
  }

  onDestroy() {
    RoomManger.getInstance().broadCast(
      {
        type: USER_LEFT,
        payload: { userId: this.userId },
      },
      this,
      this.spaceId!
    );

    RoomManger.getInstance().removeUser(this, this.spaceId!);
  }

  send(payload: OutGoingMessage) {
    this.ws.send(JSON.stringify(payload));
  }
}
