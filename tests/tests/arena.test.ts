import { del, get, post } from "../axios";
import {
  ELEMENT_URL,
  MAP_URL,
  SIGN_IN_URL,
  SIGN_UP_URL,
  SPACE_ELEMENT_URL,
  SPACE_URL,
} from "../constants";
import { password } from "../data";
import { bearerToken, randomName } from "../utils";

describe("Arena endpoints", () => {
  let mapId: string;
  let element1Id: string;
  let element2Id: string;
  let adminToken: string;
  let adminId: string;
  let userToken: string;
  let userId: string;
  let spaceId: string;

  beforeAll(async () => {
    const username = randomName();

    const signupResponse = await post(SIGN_UP_URL, {
      username,
      password,
      type: "admin",
    });

    adminId = signupResponse?.data.userId;

    const response = await post(SIGN_IN_URL, {
      username: username,
      password,
    });

    adminToken = response?.data.token;

    const userSignupResponse = await post(SIGN_UP_URL, {
      username: username + "-user",
      password,
      type: "user",
    });

    userId = userSignupResponse?.data.userId;

    const userSigninResponse = await post(SIGN_IN_URL, {
      username: username + "-user",
      password,
    });

    userToken = userSigninResponse.data.token;

    const element1Response = await post(
      ELEMENT_URL,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: bearerToken(adminToken),
        },
      }
    );

    const element2Response = await post(
      ELEMENT_URL,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: bearerToken(adminToken),
        },
      }
    );
    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const mapResponse = await post(
      MAP_URL,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "Default space",
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

    const spaceResponse = await post(
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
    console.log(spaceResponse.data);
    spaceId = spaceResponse.data.spaceId;
  });

  test("Incorrect spaceId returns a 400", async () => {
    const response: any = await get(`${SPACE_URL}/123k01`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    expect(response.status).toBe(400);
  });

  test("Correct spaceId returns all the elements", async () => {
    const response: any = await get(`${SPACE_URL}/${spaceId}`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    console.log(response.data);

    expect(response.data.dimensions).toBe("100x200");
    expect(response.data.elements.length).toBe(3);
  });

  test("Delete endpoint is able to delete an element", async () => {
    const response: any = await get(`${SPACE_URL}/${spaceId}`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    console.log(response.data.elements[0].id);

    let res = await del(SPACE_ELEMENT_URL, {
      data: { id: response.data.elements[0].id },
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    const newResponse: any = await get(`${SPACE_URL}/${spaceId}`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    expect(newResponse.data.elements.length).toBe(2);
  });

  test("Adding an element fails if the element lies outside the dimensions", async () => {
    const newResponse = await post(
      SPACE_ELEMENT_URL,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 10000,
        y: 210000,
      },
      {
        headers: {
          authorization: bearerToken(userToken),
        },
      }
    );

    expect(newResponse.status).toBe(400);
  });

  test("Adding an element works as expected", async () => {
    await post(
      SPACE_ELEMENT_URL,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      {
        headers: {
          authorization: bearerToken(userToken),
        },
      }
    );

    const newResponse: any = await get(`${SPACE_URL}/${spaceId}`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    expect(newResponse.data.elements.length).toBe(3);
  });
});
