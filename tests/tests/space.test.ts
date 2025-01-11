import { del, get, post } from "../axios";
import {
  ELEMENT_URL,
  MAP_URL,
  SIGN_IN_URL,
  SIGN_UP_URL,
  SPACE_ALL_URL,
  SPACE_URL,
} from "../constants";
import { emptyMapPostData, password, postElementData } from "../data";
import { UserType } from "../enum";
import { bearerToken, randomName } from "../utils";

describe.skip("Space information", () => {
  let mapId: string;
  let element1Id: string;
  let element2Id: string;
  let adminToken: string;
  let adminId: string;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    const username = randomName();

    const signupResponse = await post(SIGN_UP_URL, {
      username,
      password,
      type: UserType.ADMIN,
    });

    adminId = signupResponse?.data.userId;

    const response = await post(SIGN_IN_URL, {
      username,
      password,
    });

    adminToken = response?.data.token;

    const userSignupResponse = await post(SIGN_UP_URL, {
      username: username + "-user",
      password,
      type: UserType.USER,
    });

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await post(SIGN_IN_URL, {
      username: username + "-user",
      password,
    });

    userToken = userSigninResponse.data.token;

    const element1Response = await post(ELEMENT_URL, postElementData, {
      headers: {
        authorization: bearerToken(adminToken),
      },
    });

    const element2Response = await post(ELEMENT_URL, postElementData, {
      headers: {
        authorization: bearerToken(adminToken),
      },
    });
    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const mapResponse = await post(
      MAP_URL,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "Test space",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: bearerToken(adminToken),
        },
      }
    );

    mapId = mapResponse.data.id;
  });

  test("User is able to create a space", async () => {
    const response = await post(
      SPACE_URL,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: bearerToken(userToken),
        },
      }
    );
    expect(response.status).toBe(200);
    expect(response.data.id).toBeDefined();
  });

  test("User is able to create a space without mapId (empty space)", async () => {
    const response = await post(SPACE_URL, emptyMapPostData, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    expect(response.data.id).toBeDefined();
  });

  test("User is not able to create a space without mapId and dimensions", async () => {
    const response = await post(
      SPACE_URL,
      {
        name: "Test",
      },
      {
        headers: {
          authorization: bearerToken(userToken),
        },
      }
    );

    expect(response.status).toBe(400);
  });

  test("User is not able to delete a space that doesn't exist", async () => {
    const response: any = await del(`${SPACE_URL}/randomIdDoesn'tExist`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    expect(response.status).toBe(400);
  });

  test("User is able to delete a space that does exist", async () => {
    const response = await post(
      SPACE_URL,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: bearerToken(userToken),
        },
      }
    );

    const deleteResponse: any = await del(`${SPACE_URL}/${response.data.id}`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    expect(deleteResponse.status).toBe(200);
  });

  test("User should not be able to delete a space created by another user", async () => {
    const response = await post(
      SPACE_URL,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: bearerToken(userToken),
        },
      }
    );

    const deleteResponse: any = await del(`${SPACE_URL}/${response.data.id}`, {
      headers: {
        authorization: bearerToken(adminToken),
      },
    });

    expect(deleteResponse.status).toBe(403);
  });

  test("Admin has no spaces initially", async () => {
    const response: any = await get(SPACE_ALL_URL, {
      headers: {
        authorization: bearerToken(adminToken),
      },
    });
    expect(response.data.spaces.length).toBe(0);
  });

  test("Admin has gets once space after", async () => {
    const spaceCreateResponse = await post(
      SPACE_URL,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: bearerToken(adminToken),
        },
      }
    );

    const response: any = await get(SPACE_ALL_URL, {
      headers: {
        authorization: bearerToken(adminToken),
      },
    });

    const filteredSpace = response.data.spaces.find(
      (x: any) => x.id == spaceCreateResponse.data.id
    );

    expect(response.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefined();
  });
});
