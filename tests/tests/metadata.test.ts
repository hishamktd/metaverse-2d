import { post } from "../axios";
import {
  AVATAR_ADMIN_URL,
  METADATA_URL,
  SIGN_IN_URL,
  SIGN_UP_URL,
} from "../constants";
import { password, postAvatarData, wrongAvatarId } from "../data";
import { UserType } from "../enum";
import { bearerToken, randomName } from "../utils";

describe("User metadata endpoint", () => {
  let token = "";
  let avatarId = "";

  beforeAll(async () => {
    const username = randomName();

    await post(SIGN_UP_URL, {
      username,
      password,
      type: UserType.ADMIN,
    });

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
    console.log("avatar response is ", avatarResponse);

    avatarId = avatarResponse.data.id;
  });

  test("User cant update their metadata with a wrong avatar id", async () => {
    const response = await post(METADATA_URL, wrongAvatarId, {
      headers: {
        authorization: bearerToken(token),
      },
    });

    expect(response.status).toBe(400);
  });

  test("User can update their metadata with the right avatar id", async () => {
    console.log("avatarId", avatarId);

    const response = await post(
      METADATA_URL,
      { avatarId },
      {
        headers: {
          authorization: bearerToken(token),
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("User is not able to update their metadata if the auth header is not present", async () => {
    const response = await post(METADATA_URL, { avatarId });

    expect(response.status).toBe(401);
  });
});
