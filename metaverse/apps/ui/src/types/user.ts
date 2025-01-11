import { UserType } from "@/enum/user";

export type User = {
  id: string;
  username: string;
  type: UserType;
};
