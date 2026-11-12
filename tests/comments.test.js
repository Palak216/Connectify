const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./setup");

let tokenA;
let userAId;
let tokenB;
let userBId;
let postId;

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

  const postRes = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ content: "Post for comment tests" });
  postId = postRes.body.post._id;
});

afterAll(async () => {
  await closeTestDB();
});

describe("Comments API", () => {
  describe("POST /api/posts/:id/comments (Create Comment)", () => {
    it("should allow an authenticated user to add a comment to a post", async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ text: "Great post!" });

      expect(res.status).toBe(201);
      expect(res.body.comment).toHaveProperty("_id");
      expect(res.body.comment.text).toBe("Great post!");
      expect(res.body.comment.author).toBe(userBId);
      expect(res.body.comment.post).toBe(postId);
    });

    it("should reject empty comment text via Zod validation", async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ text: "   " });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/comment text is required/i);
    });
  });

  describe("GET /api/posts/:id/comments (Paginated Comments Listing)", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post(`/api/posts/${postId}/comments`)
          .set("Authorization", `Bearer ${tokenB}`)
          .send({ text: `Comment ${i}` });
      }
    });

    it("should list comments with default pagination (limit 10)", async () => {
      const res = await request(app)
        .get(`/api/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.comments).toHaveLength(5);
      expect(res.body.totalComments).toBe(5);
      expect(res.body.totalPages).toBe(1);
    });

    it("should paginate comments when limit is specified", async () => {
      const res = await request(app)
        .get(`/api/posts/${postId}/comments?page=1&limit=2`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.comments).toHaveLength(2);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(2);
      expect(res.body.totalPages).toBe(3);
      expect(res.body.totalComments).toBe(5);
    });
  });

  describe("DELETE /api/comments/:id (Author-Only Comment Deletion)", () => {
    let commentId;

    beforeEach(async () => {
      const commentRes = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ text: "Comment to be deleted" });
      commentId = commentRes.body.comment._id;
    });

    it("should allow the author to delete their own comment", async () => {
      const res = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/comment deleted successfully/i);

      // Verify comment is removed from post
      const listRes = await request(app)
        .get(`/api/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${tokenA}`);
      expect(listRes.body.comments).toHaveLength(0);
    });

    it("should reject deletion if requested by a non-author (403)", async () => {
      const res = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });
  });
});
