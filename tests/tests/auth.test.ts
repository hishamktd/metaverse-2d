import { post } from "../axios";
import { SIGN_IN_URL, SIGN_UP_URL } from "../constants";
import { password } from "../data";
import { UserType } from "../enum";
import { randomName } from "../utils";

describe("Authentication", () => {
  test("User is able to sign up only once", async () => {
    const username = randomName();
    const response = await post(SIGN_UP_URL, {
      username,
      password,
      type: UserType.ADMIN,
    });

    expect(response.status).toBe(201);
    const updatedResponse = await post(SIGN_UP_URL, {
      username,
      password,
      type: UserType.ADMIN,
    });

    expect(updatedResponse.status).toBe(400);
  });

  test("Signup request fails if the username is empty", async () => {
    const username = randomName();

    const response = await post(SIGN_UP_URL, {
      password,
    });

    expect(response?.status).toBe(400);
  });

  test("Signin succeeds if the username and password are correct", async () => {
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

    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });

  test("Signin fails if the username and password are incorrect", async () => {
    const username = randomName();

    await post(SIGN_UP_URL, {
      username,
      password,
      role: "admin",
    });

    const response = await post(SIGN_IN_URL, {
      username: "WrongUsername",
      password,
    });

    expect(response.status).toBe(403);
  });
});
