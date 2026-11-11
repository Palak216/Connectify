const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./setup");

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Auth API", () => {
  describe("POST /api/auth/signup", () => {
    it("should successfully register a new user and return a JWT token", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "alice",
          email: "alice@example.com",
          password: "password123",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.username).toBe("alice");
      expect(res.body.user.email).toBe("alice@example.com");
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should reject signup with an existing email", async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({
          username: "alice",
          email: "alice@example.com",
          password: "password123",
        });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "alice2",
          email: "alice@example.com",
          password: "password456",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it("should reject signup with invalid email or short password via Zod", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "bob",
          email: "not-an-email",
          password: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({
          username: "charlie",
          email: "charlie@example.com",
          password: "correctpassword",
        });
    });

    it("should log in with valid credentials and return a token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "charlie@example.com",
          password: "correctpassword",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe("charlie@example.com");
    });

    it("should reject login with incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "charlie@example.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it("should reject login with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown@example.com",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });
  });

  describe("Protected Route Rejection Without Token", () => {
    it("should reject access to GET /api/posts when no token is provided", async () => {
      const res = await request(app).get("/api/posts");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/no token|authorization denied/i);
    });

    it("should reject access when an invalid token is provided", async () => {
      const res = await request(app)
        .get("/api/posts")
        .set("Authorization", "Bearer invalid_garbage_token");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token is not valid/i);
    });

    it("should reject POST /api/auth/logout without a token", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(401);
    });

    it("should successfully log out with a valid token", async () => {
      const signupRes = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "logoutuser",
          email: "logout@example.com",
          password: "password123",
        });

      const token = signupRes.body.token;

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/logged out successfully/i);
    });
  });
});
