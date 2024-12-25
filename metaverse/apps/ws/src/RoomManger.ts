import { OutGoingMessage } from "./types";
import type { User } from "./User";

export class RoomManger {
  room: Map<string, User[]> = new Map();
  static instance: RoomManger;

  private constructor() {
    this.room = new Map();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RoomManger();
    }

    return this.instance;
  }

  public addUser(spaceId: string, user: User) {
    if (!this.room.has(spaceId)) {
      this.room.set(spaceId, [user]);
      return;
    }

    this.room.set(spaceId, [...(this.room.get(spaceId) ?? []), user]);
  }

  public removeUser(user: User, spaceId: string) {
    if (!this.room.has(spaceId)) {
      return;
    }

    this.room.set(
      spaceId,
      (this.room.get(spaceId) ?? []).filter((u) => u.id !== user.id)
    );
  }

  public broadCast(message: OutGoingMessage, user: User, roomId: string) {
    if (!this.room.has(roomId)) {
      return;
    }

    this.room.get(roomId)?.forEach((u) => {
      if (u.id !== user.id) {
        u.send(message);
      }
    });
  }
}
