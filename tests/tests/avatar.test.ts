import { get, post } from "../axios";
import {
  AVATAR_ADMIN_URL,
  AVATAR_URL,
  METADATA_BULK_URL,
  SIGN_IN_URL,
  SIGN_UP_URL,
} from "../constants";
import { password, postAvatarData } from "../data";
import { UserType } from "../enum";
import { bearerToken, randomName } from "../utils";

describe("User avatar information", () => {
  let avatarId: string;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const username = randomName();

    const signupResponse = await post(SIGN_UP_URL, {
      username,
      password,
      type: UserType.ADMIN,
    });

    userId = signupResponse?.data.userId;

    console.log("userid is " + userId);
    const response = await post(SIGN_IN_URL, {
      username,
      password,
    });

    token = response?.data.token;

    const avatarResponse = await post(AVATAR_ADMIN_URL, postAvatarData, {
      headers: {
        authorization: bearerToken(token),
      },
    });

    avatarId = avatarResponse.data.id;
  });

  test("Get back avatar information for a user", async () => {
    console.log("asking for user with id " + userId);

    const response: any = await get(`${METADATA_BULK_URL}?ids=${userId}`, {
      headers: {
        authorization: bearerToken(token),
      },
    });

    console.log("response was " + userId);

    console.log(JSON.stringify(response.data));

    expect(response.data.avatars.length).toBe(1);

    expect(response.data.avatars[0].userId).toBe(userId);
  });

  test("Available avatars lists the recently created avatar", async () => {
    const response: any = await get(AVATAR_URL, {
      headers: {
        authorization: bearerToken(token),
      },
    });

    console.log("response was ", response.data);

    console.log("avatar id is " + avatarId);

    expect(response.data.avatars?.length).not.toBe(0);

    const currentAvatar = response.data.avatars.find(
      (x: any) => x.id == avatarId
    );

    expect(currentAvatar).toBeDefined();
  });
});
