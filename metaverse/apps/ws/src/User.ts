import { WebSocket } from "ws";
import { WSType } from "./enum";
import { RoomManger } from "./RoomManger";
import { OutGoingMessage } from "./types";
import client from "@repo/db/client";
import jsw, { JwtPayload } from "jsonwebtoken";

const getRandomString = () => Math.random().toString(36).substring(2, 9);

const { JOIN, MOVE, SPACE_JOINED, MOVEMENT_REJECTED, USER_JOINED, USER_LEFT } =
  WSType;

export class User {
  id: string;
  private spaceId?: string;
  private x: number;
  private y: number;
  private userId?: string;

  constructor(private ws: WebSocket) {
    this.id = getRandomString();
    this.x = 0;
    this.y = 0;
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      const parsedData = JSON.parse(data.toString());

      switch (parsedData.type) {
        case JOIN:
          const spaceId = parsedData.payload.spaceId;
          const token = parsedData.payload.token;

          const userId = (
            jsw.verify(token, process.env.JWT_SECRET!) as JwtPayload
          ).userId;

          if (!userId) {
            this.ws.close();
            return;
          }

          this.userId = userId;

          const space = await client.space.findUnique({
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
              users: RoomManger.getInstance()
                .room.get(spaceId)
                ?.map((u) => ({ id: u.id })),
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

          const xDis = Math.abs(moveX - this.x);
          const yDis = Math.abs(moveY - this.y);

          if ((xDis === 1 && yDis === 0) || (xDis === 0 && yDis === 1)) {
            this.x = moveX;
            this.y = moveY;

            RoomManger.getInstance().broadCast(
              {
                type: MOVE,
                payload: {
                  x: this.x,
                  y: this.y,
                  userId: this.id,
                },
              },
              this,
              this.spaceId!
            );
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
