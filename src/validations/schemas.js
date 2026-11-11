const { z } = require("zod");
const mongoose = require("mongoose");

const objectIdSchema = z
  .string({ required_error: "ID is required" })
  .refine((val) => mongoose.isValidObjectId(val), {
    message: "Invalid ID format",
  });

// Auth schemas
const signupSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .trim()
      .min(1, "Username cannot be empty"),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Invalid email format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Invalid email format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  }),
});

// Post schemas
const createPostSchema = z.object({
  body: z.object({
    content: z.string().optional(),
  }),
});

const postIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Comment schemas
const addCommentSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    text: z
      .string({ required_error: "Comment text is required" })
      .trim()
      .min(1, "Comment text is required"),
  }),
});

const commentIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Follow schemas
const followUserParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

const notificationIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

module.exports = {
  objectIdSchema,
  signupSchema,
  loginSchema,
  createPostSchema,
  postIdParamSchema,
  addCommentSchema,
  commentIdParamSchema,
  followUserParamSchema,
  notificationIdParamSchema,
};
