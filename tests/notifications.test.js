const request = require("supertest");
const { io: Client } = require("socket.io-client");
const app = require("../app");
const Notification = require("../src/models/notification");
const { connectTestDB, clearTestDB, closeTestDB } = require("./setup");

let tokenA;
let userAId;
let tokenB;
let userBId;
let postBId;
let serverPort;

beforeAll(async () => {
  await connectTestDB();

  // Bind app.server to an ephemeral port for real socket tests
  await new Promise((resolve) => {
    app.server.listen(0, () => {
      serverPort = app.server.address().port;
      resolve();
    });
  });
});

beforeEach(async () => {
  await clearTestDB();

  const userARes = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "userA",
      email: "userA@example.com",
      password: "password123",
    });
  tokenA = userARes.body.token;
  userAId = userARes.body.user.id;

  const userBRes = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "userB",
      email: "userB@example.com",
      password: "password123",
    });
  tokenB = userBRes.body.token;
  userBId = userBRes.body.user.id;

  const postBRes = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${tokenB}`)
    .send({ content: "User B post for notification test" });
  postBId = postBRes.body.post._id;
});

afterAll(async () => {
  await new Promise((resolve) => {
    app.server.close(resolve);
  });
  await closeTestDB();
});

describe("Notifications API & Socket.IO", () => {
  describe("REST Endpoints", () => {
    it("should reject GET /api/notifications without authentication (401)", async () => {
      const res = await request(app).get("/api/notifications");

      expect(res.status).toBe(401);
    });

    it("should return own notifications only, with pagination and unreadCount", async () => {
      // User A likes User B's post -> Notification created for User B
      await request(app)
        .post(`/api/posts/${postBId}/like`)
        .set("Authorization", `Bearer ${tokenA}`);

      // User B follows User A -> Notification created for User A
      await request(app)
        .post(`/api/users/${userAId}/follow`)
        .set("Authorization", `Bearer ${tokenB}`);

      // Fetch User B's notifications
      const resB = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${tokenB}`);

      expect(resB.status).toBe(200);
      expect(resB.body.notifications).toHaveLength(1);
      expect(resB.body.notifications[0].type).toBe("like");
      expect(resB.body.unreadCount).toBe(1);

      // Fetch User A's notifications
      const resA = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(resA.status).toBe(200);
      expect(resA.body.notifications).toHaveLength(1);
      expect(resA.body.notifications[0].type).toBe("follow");
    });

    it("should allow recipient to mark a notification as read (PATCH /:id/read)", async () => {
      // User A likes User B's post
      await request(app)
        .post(`/api/posts/${postBId}/like`)
        .set("Authorization", `Bearer ${tokenA}`);

      const notif = await Notification.findOne({ recipient: userBId });

      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.notification.read).toBe(true);
    });

    it("should reject non-recipient from marking another user's notification as read (403)", async () => {
      await request(app)
        .post(`/api/posts/${postBId}/like`)
        .set("Authorization", `Bearer ${tokenA}`);

      const notif = await Notification.findOne({ recipient: userBId });

      // User A attempts to mark User B's notification
      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it("should mark all unread notifications as read (PATCH /read-all)", async () => {
      // User A likes post and comments on post -> 2 notifications for B
      await request(app)
        .post(`/api/posts/${postBId}/like`)
        .set("Authorization", `Bearer ${tokenA}`);

      await request(app)
        .post(`/api/posts/${postBId}/comments`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ text: "Nice post!" });

      const res = await request(app)
        .patch("/api/notifications/read-all")
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/all notifications marked as read/i);

      const unreadCount = await Notification.countDocuments({
        recipient: userBId,
        read: false,
      });
      expect(unreadCount).toBe(0);
    });
  });

  describe("Real-Time Socket.IO Integration", () => {
    it("should reject unauthenticated socket connections", (done) => {
      const socket = Client(`http://localhost:${serverPort}`, {
        auth: { token: "invalid_token" },
        transports: ["websocket"],
      });

      socket.on("connect_error", (err) => {
        expect(err.message).toMatch(/authentication error/i);
        socket.disconnect();
        done();
      });
    });

    it("should authenticate socket, deliver real-time like notification, and verify database persistence", (done) => {
      // Connect User B socket with valid JWT token
      const clientSocketB = Client(`http://localhost:${serverPort}`, {
        auth: { token: tokenB },
        transports: ["websocket"],
      });

      clientSocketB.on("connect", async () => {
        // Set up listener for the real-time notification event
        clientSocketB.on("notification", async (data) => {
          try {
            expect(data.type).toBe("like");
            expect(data.recipient.toString()).toBe(userBId.toString());
            expect(data.actor.username).toBe("userA");

            // Verify notification is stored in MongoDB (source of truth)
            const storedNotif = await Notification.findOne({
              recipient: userBId,
              type: "like",
            });
            expect(storedNotif).not.toBeNull();
            expect(storedNotif.read).toBe(false);

            clientSocketB.disconnect();
            done();
          } catch (err) {
            clientSocketB.disconnect();
            done(err);
          }
        });

        // User A likes User B's post
        await request(app)
          .post(`/api/posts/${postBId}/like`)
          .set("Authorization", `Bearer ${tokenA}`);
      });
    });
  });
});
