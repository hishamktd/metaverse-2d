import { WS_URL } from "../apis";
import { post } from "../axios";
import {
  ELEMENT_URL,
  MAP_URL,
  SIGN_IN_URL,
  SIGN_UP_URL,
  SPACE_URL,
} from "../constants";
import { password } from "../data";
import { bearerToken, randomName } from "../utils";

describe("Websocket tests", () => {
  let adminToken: string;
  let adminUserId: string;
  let userToken: string;
  let adminId: string = "";
  let userId: string;
  let mapId: string;
  let element1Id: string;
  let element2Id: string;
  let spaceId: string;
  let ws1: WebSocket;
  let ws2: WebSocket;
  let ws1Messages: any[] = [];
  let ws2Messages: any[] = [];
  let userX: number;
  let userY: number;
  let adminX: number;
  let adminY: number;

  function waitForAndPopLatestMessage(messageArray: any[]) {
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

    const message1: any = await waitForAndPopLatestMessage(ws1Messages);

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

    const message2: any = await waitForAndPopLatestMessage(ws2Messages);
    const message3: any = await waitForAndPopLatestMessage(ws1Messages);

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

    const message: any = await waitForAndPopLatestMessage(ws1Messages);

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

    const message: any = await waitForAndPopLatestMessage(ws1Messages);

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

    const message: any = await waitForAndPopLatestMessage(ws2Messages);

    expect(message.type).toBe("movement");
    expect(message.payload.x).toBe(adminX + 1);
    expect(message.payload.y).toBe(adminY);
  });

  test("If a user leaves, the other user receives a leave event", async () => {
    ws1.close();

    const message: any = await waitForAndPopLatestMessage(ws2Messages);

    expect(message.type).toBe("user-left");
    expect(message.payload.userId).toBe(adminUserId);
  });
});