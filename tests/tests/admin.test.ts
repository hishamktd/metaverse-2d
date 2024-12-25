import { post, put } from "../axios";
import {
  AVATAR_ADMIN_URL,
  ELEMENT_URL,
  MAP_URL,
  SIGN_IN_URL,
  SIGN_UP_URL,
  SPACE_ELEMENT_URL,
} from "../constants";
import { password } from "../data";
import { UserType } from "../enum";
import { bearerToken, randomName } from "../utils";

describe("Admin Endpoints", () => {
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
      username: username,
      password,
    });

    adminToken = response?.data.token;

    const userSignupResponse = await post(SIGN_UP_URL, {
      username: username + "-user",
      password,
      type: UserType.USER,
    });

    userId = userSignupResponse?.data.userId;

    const userSigninResponse = await post(SIGN_IN_URL, {
      username: username + "-user",
      password,
    });

    userToken = userSigninResponse.data.token;
  });

  test("User is not able to hit admin Endpoints", async () => {
    const elementResponse = await post(
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
          authorization: bearerToken(userToken),
        },
      }
    );

    const mapResponse = await post(
      MAP_URL,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "test space",
        defaultElements: [],
      },
      {
        headers: {
          authorization: bearerToken(userToken),
        },
      }
    );

    const avatarResponse = await post(
      AVATAR_ADMIN_URL,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: bearerToken(userToken),
        },
      }
    );

    const updateElementResponse: any = await put(
      `${SPACE_ELEMENT_URL}/123`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      },
      {
        headers: {
          authorization: bearerToken(userToken),
        },
      }
    );

    expect(elementResponse.status).toBe(403);
    expect(mapResponse.status).toBe(403);
    expect(avatarResponse.status).toBe(403);
    expect(updateElementResponse.status).toBe(404);
  });

  test("Admin is able to hit admin Endpoints", async () => {
    const elementResponse = await post(
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

    const mapResponse = await post(
      MAP_URL,
      {
        thumbnail: "https://thumbnail.com/a.png",
        name: "Space",
        dimensions: "100x200",
        defaultElements: [],
      },
      {
        headers: {
          authorization: bearerToken(adminToken),
        },
      }
    );

    const avatarResponse = await post(
      AVATAR_ADMIN_URL,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: bearerToken(adminToken),
        },
      }
    );
    expect(elementResponse.status).toBe(200);
    expect(mapResponse.status).toBe(200);
    expect(avatarResponse.status).toBe(200);
  });

  test("Admin is able to update the imageUrl for an element", async () => {
    const elementResponse = await post(
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

    const updateElementResponse: any = await put(
      `${ELEMENT_URL}/${elementResponse.data.id}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      },
      {
        headers: {
          authorization: bearerToken(adminToken),
        },
      }
    );

    expect(updateElementResponse.status).toBe(200);
  });
});
