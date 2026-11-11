const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./setup");

let tokenA;
let userAId;
let tokenB;
let userBId;
let tokenC;
let userCId;

beforeAll(async () => {
  await connectTestDB();
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

  const userCRes = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "userC",
      email: "userC@example.com",
      password: "password123",
    });
  tokenC = userCRes.body.token;
  userCId = userCRes.body.user.id;
});

afterAll(async () => {
  await closeTestDB();
});

describe("Follow & Feed API", () => {
  describe("Follow Rules (/api/users/:id/follow & /unfollow)", () => {
    it("should allow User A to follow User B", async () => {
      const res = await request(app)
        .post(`/api/users/${userBId}/follow`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/successfully followed/i);
      expect(res.body.follow.follower).toBe(userAId);
      expect(res.body.follow.following).toBe(userBId);
    });

    it("should reject a user trying to follow themselves (400)", async () => {
      const res = await request(app)
        .post(`/api/users/${userAId}/follow`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot follow yourself/i);
    });

    it("should reject duplicate follows (400)", async () => {
      await request(app)
        .post(`/api/users/${userBId}/follow`)
        .set("Authorization", `Bearer ${tokenA}`);

      const res = await request(app)
        .post(`/api/users/${userBId}/follow`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already following/i);
    });

    it("should allow User A to unfollow User B", async () => {
      await request(app)
        .post(`/api/users/${userBId}/follow`)
        .set("Authorization", `Bearer ${tokenA}`);

      const res = await request(app)
        .post(`/api/users/${userBId}/unfollow`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/successfully unfollowed/i);
    });

    it("should reject unfollowing a user not currently followed (400)", async () => {
      const res = await request(app)
        .post(`/api/users/${userBId}/unfollow`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/not following this user/i);
    });
  });

  describe("Feed (/api/feed with Cursor Pagination)", () => {
    beforeEach(async () => {
      // User A follows User B, but does NOT follow User C
      await request(app)
        .post(`/api/users/${userBId}/follow`)
        .set("Authorization", `Bearer ${tokenA}`);

      // User B creates 3 posts with slight delay to ensure distinct createdAt timestamps
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post("/api/posts")
          .set("Authorization", `Bearer ${tokenB}`)
          .send({ content: `User B Post ${i}` });
      }

      // User C creates a post (should NOT appear in A's feed)
      await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${tokenC}`)
        .send({ content: "User C secret post" });
    });

    it("should return posts exclusively from followed users", async () => {
      const res = await request(app)
        .get("/api/feed")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(3);
      res.body.posts.forEach((post) => {
        expect(post.author._id).toBe(userBId);
      });
    });

    it("should return empty feed if user follows nobody", async () => {
      const res = await request(app)
        .get("/api/feed")
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(0);
      expect(res.body.hasMore).toBe(false);
      expect(res.body.nextCursor).toBeNull();
    });

    it("should paginate correctly using cursor-based pagination", async () => {
      // Fetch limit 2
      const firstPage = await request(app)
        .get("/api/feed?limit=2")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(firstPage.status).toBe(200);
      expect(firstPage.body.posts).toHaveLength(2);
      expect(firstPage.body.hasMore).toBe(true);
      expect(firstPage.body.nextCursor).toBeDefined();

      const cursor = firstPage.body.nextCursor;

      // Fetch next page using cursor
      const secondPage = await request(app)
        .get(`/api/feed?limit=2&cursor=${cursor}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(secondPage.status).toBe(200);
      expect(secondPage.body.posts).toHaveLength(1);
      expect(secondPage.body.hasMore).toBe(false);
      expect(secondPage.body.nextCursor).toBeNull();
    });
  });
});
