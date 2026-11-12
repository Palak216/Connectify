const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./setup");

let tokenA;
let userAId;
let tokenB;
let userBId;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  const userARes = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "usera",
      email: "usera@example.com",
      password: "password123",
    });
  tokenA = userARes.body.token;
  userAId = userARes.body.user.id;

  const userBRes = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "userb",
      email: "userb@example.com",
      password: "password123",
    });
  tokenB = userBRes.body.token;
  userBId = userBRes.body.user.id;
});

afterAll(async () => {
  await closeTestDB();
});

describe("Posts API", () => {
  describe("POST /api/posts (Post Creation)", () => {
    it("should allow an authenticated user to create a text post", async () => {
      const res = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ content: "Hello Connectify!" });

      expect(res.status).toBe(201);
      expect(res.body.post).toHaveProperty("_id");
      expect(res.body.post.content).toBe("Hello Connectify!");
      expect(res.body.post.author).toBe(userAId);
    });

    it("should reject post creation if neither text content nor image is provided", async () => {
      const res = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ content: "   " });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/content or an image is required/i);
    });
  });

  describe("GET /api/posts (Posts Pagination)", () => {
    beforeEach(async () => {
      // Create 5 posts
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post("/api/posts")
          .set("Authorization", `Bearer ${tokenA}`)
          .send({ content: `Post number ${i}` });
      }
    });

    it("should return paginated posts with default page=1 and limit=10", async () => {
      const res = await request(app)
        .get("/api/posts")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(5);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(10);
      expect(res.body.totalPosts).toBe(5);
      expect(res.body.totalPages).toBe(1);
    });

    it("should paginate correctly when page and limit query params are provided", async () => {
      const res = await request(app)
        .get("/api/posts?page=1&limit=2")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(2);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(2);
      expect(res.body.totalPages).toBe(3);
      expect(res.body.totalPosts).toBe(5);
    });
  });

  describe("POST /api/posts/:id/like (Like Uniqueness & Atomic Toggle)", () => {
    let postId;

    beforeEach(async () => {
      const postRes = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ content: "Likeable post" });
      postId = postRes.body.post._id;
    });

    it("should like a post on first request and increment like count to 1", async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Post liked");
      expect(res.body.likes).toBe(1);
    });

    it("should unlike the post on second request and decrement like count to 0", async () => {
      // Like
      await request(app)
        .post(`/api/posts/${postId}/like`)
        .set("Authorization", `Bearer ${tokenA}`);

      // Unlike
      const res = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Post unliked");
      expect(res.body.likes).toBe(0);
    });

    it("should enforce like uniqueness under concurrent requests ($addToSet guarantee)", async () => {
      // Two concurrent like requests from User B
      const [res1, res2] = await Promise.all([
        request(app)
          .post(`/api/posts/${postId}/like`)
          .set("Authorization", `Bearer ${tokenB}`),
        request(app)
          .post(`/api/posts/${postId}/like`)
          .set("Authorization", `Bearer ${tokenB}`),
      ]);

      // Verify the final post state in DB: User B must never be duplicated in likes array
      const checkRes = await request(app)
        .get("/api/posts")
        .set("Authorization", `Bearer ${tokenA}`);
      const targetPost = checkRes.body.posts.find((p) => p._id === postId);

      expect(targetPost.likes.length).toBeLessThanOrEqual(1);
    });
  });

  describe("DELETE /api/posts/:id (Post Deletion)", () => {
    let postId;

    beforeEach(async () => {
      const postRes = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ content: "Post to delete" });
      postId = postRes.body.post._id;
    });

    it("should allow the author to delete their own post", async () => {
      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/post deleted successfully/i);
    });

    it("should reject deletion if requested by a non-author (403)", async () => {
      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });
  });
});
