const axios2 = require("axios");
const WebSocket = require("ws");

// ** API BASE URL ** //
const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3001";

// ** API ENDPOINTS ** //

const SIGN_UP_URL = `${BACKEND_URL}/api/v1/signup`;

const SIGN_IN_URL = `${BACKEND_URL}/api/v1/signin`;

const MAP_URL = `${BACKEND_URL}/api/v1/admin/map`;

const SPACE_URL = `${BACKEND_URL}/api/v1/space`;

const SPACE_ALL_URL = `${SPACE_URL}/all`;

const SPACE_ELEMENT_URL = `${SPACE_URL}/element`;

const AVATAR_ADMIN_URL = `${BACKEND_URL}/api/v1/admin/avatar`;

const METADATA_URL = `${BACKEND_URL}/api/v1/user/metadata`;

const METADATA_BULK_URL = `${BACKEND_URL}/api/v1/user/metadata/bulk`;

const AVATAR_URL = `${BACKEND_URL}/api/v1/avatars`;

const ELEMENT_URL = `${BACKEND_URL}/api/v1/admin/element`;

// ** Axios instance ** //
const axios = {
  post: async (...args) => {
    try {
      const res = await axios2.post(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  get: async (...args) => {
    try {
      const res = await axios2.get(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  put: async (...args) => {
    try {
      const res = await axios2.put(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  del: async (...args) => {
    try {
      const res = await axios2.delete(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
};

// ** Helper functions ** //
const randomName = () => `test-${Math.random().toString(36)}`;

const bearerToken = (token) => `Bearer ${token}`;

// ** Constants ** //
const postAvatarData = {
  imageUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
  name: "Timmy",
};

const wrongAvatarId = {
  avatarId: "123123123",
};

const postElementData = {
  imageUrl:
    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
  width: 1,
  height: 1,
  static: true,
};

const emptyMapPostData = {
  name: "Test",
  dimensions: "100x200",
};

const { del, get, post, put } = axios;

describe("Authentication", () => {
  test("User is able to sign up only once", async () => {
    const username = randomName();
    const password = "123456";
    const response = await post(SIGN_UP_URL, {
      username,
      password,
      type: "admin",
    });

    expect(response?.status)?.toBe(200);
    const updatedResponse = await post(SIGN_UP_URL, {
      username,
      password,
      type: "admin",
    });

    expect(updatedResponse?.status)?.toBe(400);
  });

  test("Signup request fails if the username is empty", async () => {
    const username = randomName();
    const password = "123456";

    const response = await post(SIGN_UP_URL, {
      password,
    });

    expect(response?.status).toBe(400);
  });

  test("Signin succeeds if the username and password are correct", async () => {
    const username = randomName();
    const password = "123456";

    await post(SIGN_UP_URL, {
      username,
      password,
      type: "admin",
    });

    const response = await post(SIGN_IN_URL, {
      username,
      password,
    });

    expect(response?.status).toBe(200);
    expect(response?.data.token).toBeDefined();
  });

  test("Signin fails if the username and password are incorrect", async () => {
    const username = randomName();
    const password = "123456";

    await post(SIGN_UP_URL, {
      username,
      password,
      role: "admin",
    });

    const response = await post(SIGN_IN_URL, {
      username: "WrongUsername",
      password,
    });

    expect(response?.status)?.toBe(403);
  });
});

describe("User metadata endpoint", () => {
  let token = "";
  let avatarId = "";

  beforeAll(async () => {
    const username = randomName();
    const password = "123456";

    await post(SIGN_UP_URL, {
      username,
      password,
      type: "admin",
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
    console.log("avatar response is " + avatarResponse?.data.avatarId);

    avatarId = avatarResponse.data.avatarId;
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

    expect(response.status).toBe(403);
  });

  test("test 3", () => {});
});

describe("User avatar information", () => {
  let avatarId;
  let token;
  let userId;

  beforeAll(async () => {
    const username = `Haifa-${Math.random()}`;
    const password = "123456";

    const signupResponse = await post(SIGN_UP_URL, {
      username,
      password,
      type: "admin",
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

    avatarId = avatarResponse.data.avatarId;
  });

  test("Get back avatar information for a user", async () => {
    console.log("asking for user with id " + userId);
    const response = await get(`${METADATA_BULK_URL}?ids=[${userId}]`);
    console.log("response was " + userId);
    console.log(JSON.stringify(response.data));
    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
  });

  test("Available avatars lists the recently created avatar", async () => {
    const response = await get(AVATAR_URL);
    expect(response.data.avatars?.length).not.toBe(0);
    const currentAvatar = response.data.avatars.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});

describe("Space information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll(async () => {
    const username = randomName();
    const password = "123456";

    const signupResponse = await post(SIGN_UP_URL, {
      username,
      password,
      type: "admin",
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
      type: "user",
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
    console.log(element2Id);
    console.log(element1Id);
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
    console.log("mapResponse.status");
    console.log(mapResponse.data.id);

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
    expect(response.data.spaceId).toBeDefined();
  });

  test("User is able to create a space without mapId (empty space)", async () => {
    const response = await post(SPACE_URL, emptyMapPostData, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    expect(response.data.spaceId).toBeDefined();
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
    const response = await del(`${SPACE_URL}/randomIdDoesn'tExist`, {
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

    const deleteResponse = await del(`${SPACE_URL}/${response.data.spaceId}`, {
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

    const deleteResponse = await del(`${SPACE_URL}/${response.data.spaceId}`, {
      headers: {
        authorization: bearerToken(adminToken),
      },
    });

    expect(deleteResponse.status).toBe(403);
  });

  test("Admin has no spaces initially", async () => {
    const response = await get(SPACE_ALL_URL, {
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
    console.log("Hi im here line 511");
    console.log(spaceCreateResponse.data);
    const response = await get(SPACE_ALL_URL, {
      headers: {
        authorization: bearerToken(adminToken),
      },
    });
    const filteredSpace = response.data.spaces.find(
      (x) => x.id == spaceCreateResponse.data.spaceId
    );
    expect(response.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefined();
  });
});

describe("Arena endpoints", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userToken;
  let userId;
  let spaceId;

  beforeAll(async () => {
    const username = randomName();
    const password = "123456";

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
    const response = await get(`${SPACE_URL}/123k01`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });
    expect(response.status).toBe(400);
  });

  test("Correct spaceId returns all the elements", async () => {
    const response = await get(`${SPACE_URL}/${spaceId}`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });
    console.log(response.data);
    expect(response.data.dimensions).toBe("100x200");
    expect(response.data.elements.length).toBe(3);
  });

  test("Delete endpoint is able to delete an element", async () => {
    const response = await get(`${SPACE_URL}/${spaceId}`, {
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

    const newResponse = await get(`${SPACE_URL}/${spaceId}`, {
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

    const newResponse = await get(`${SPACE_URL}/${spaceId}`, {
      headers: {
        authorization: bearerToken(userToken),
      },
    });

    expect(newResponse.data.elements.length).toBe(3);
  });
});

describe("Admin Endpoints", () => {
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll(async () => {
    const username = randomName();
    const password = "123456";

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

    const updateElementResponse = await put(
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
    expect(updateElementResponse.status).toBe(403);
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

    const updateElementResponse = await put(
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

describe("Websocket tests", () => {
  let adminToken;
  let adminUserId;
  let userToken;
  let adminId;
  let userId;
  let mapId;
  let element1Id;
  let element2Id;
  let spaceId;
  let ws1;
  let ws2;
  let ws1Messages = [];
  let ws2Messages = [];
  let userX;
  let userY;
  let adminX;
  let adminY;

  function waitForAndPopLatestMessage(messageArray) {
    return new Promise((resolve) => {
      if (messageArray.length > 0) {
        resolve(messageArray.shift());
      } else {
        let interval = setInterval(() => {
          if (messageArray.length > 0) {
            resolve(messageArray.shift());
            clearInterval(interval);
          }
        }, 100);
      }
    });
  }

  async function setupHTTP() {
    const username = randomName();
    const password = "123456";
    const adminSignupResponse = await post(SIGN_UP_URL, {
      username,
      password,
      type: "admin",
    });

    const adminSigninResponse = await post(SIGN_IN_URL, {
      username,
      password,
    });

    adminUserId = adminSignupResponse?.data.userId;
    adminToken = adminSigninResponse?.data.token;
    console.log("adminSignupResponse.status");
    console.log(adminSignupResponse?.status);

    const userSignupResponse = await post(SIGN_UP_URL, {
      username: username + `-user`,
      password,
      type: "user",
    });
    const userSigninResponse = await post(SIGN_IN_URL, {
      username: username + `-user`,
      password,
    });
    userId = userSignupResponse?.data.userId;
    userToken = userSigninResponse?.data.token;
    console.log("user-token", userToken);
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
    element1Id = element1Response?.data.id;
    element2Id = element2Response?.data.id;

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
    mapId = mapResponse?.data.id;

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

    console.log(spaceResponse?.status);
    spaceId = spaceResponse?.data.spaceId;
  }
  async function setupWs() {
    ws1 = new WebSocket(WS_URL);

    ws1.onmessage = (event) => {
      console.log("got back a data 1");
      console.log(event.data);

      ws1Messages.push(JSON.parse(event.data));
    };
    await new Promise((r) => {
      ws1.onopen = r;
    });

    ws2 = new WebSocket(WS_URL);

    ws2.onmessage = (event) => {
      console.log("got back data 2");
      console.log(event.data);
      ws2Messages.push(JSON.parse(event.data));
    };
    await new Promise((r) => {
      ws2.onopen = r;
    });
  }

  beforeAll(async () => {
    await setupHTTP();
    await setupWs();
  }, 10000);

  test("Get back ack for joining the space", async () => {
    console.log("insixce first test");
    ws1.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceId: spaceId,
          token: adminToken,
        },
      })
    );
    console.log("insixce first test1");
    const message1 = await waitForAndPopLatestMessage(ws1Messages);
    console.log("insixce first test2");
    ws2.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceId: spaceId,
          token: userToken,
        },
      })
    );
    console.log("insixce first test3");

    const message2 = await waitForAndPopLatestMessage(ws2Messages);
    const message3 = await waitForAndPopLatestMessage(ws1Messages);

    expect(message1.type).toBe("space-joined");
    expect(message2.type).toBe("space-joined");
    expect(message1.payload.users.length).toBe(0);
    expect(message2.payload.users.length).toBe(1);
    expect(message3.type).toBe("user-joined");
    expect(message3.payload.x).toBe(message2.payload.spawn.x);
    expect(message3.payload.y).toBe(message2.payload.spawn.y);
    expect(message3.payload.userId).toBe(userId);

    adminX = message1.payload.spawn.x;
    adminY = message1.payload.spawn.y;

    userX = message2.payload.spawn.x;
    userY = message2.payload.spawn.y;
  });

  test("User should not be able to move across the boundary of the wall", async () => {
    ws1.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: 1000000,
          y: 10000,
        },
      })
    );

    const message = await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).toBe("movement-rejected");
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  });

  test("User should not be able to move two blocks at the same time", async () => {
    ws1.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: adminX + 2,
          y: adminY,
        },
      })
    );

    const message = await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).toBe("movement-rejected");
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  });

  test("Correct movement should be broadcasted to the other sockets in the room", async () => {
    ws1.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: adminX + 1,
          y: adminY,
          userId: adminId,
        },
      })
    );

    const message = await waitForAndPopLatestMessage(ws2Messages);
    expect(message.type).toBe("movement");
    expect(message.payload.x).toBe(adminX + 1);
    expect(message.payload.y).toBe(adminY);
  });

  test("If a user leaves, the other user receives a leave event", async () => {
    ws1.close();
    const message = await waitForAndPopLatestMessage(ws2Messages);
    expect(message.type).toBe("user-left");
    expect(message.payload.userId).toBe(adminUserId);
  });
});
