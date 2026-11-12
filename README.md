# Connectify

Connectify is a full-stack social media web application built with Node.js, Express, MongoDB, Socket.IO, and React. It features stateless JWT authentication, atomic likes, paginated feeds and comments, follow relationships, and real-time push notifications.

---

## 🌐 Live Demo

- **Live Application**: *[Add your live deployment link here]*
- **Repository**: [https://github.com/Palak216/mini-instagram-backend](https://github.com/Palak216/mini-instagram-backend)

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Communication**: Socket.IO
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs` (work factor: 10)
- **Validation**: Zod schema validation
- **File Uploads**: Multer with local disk storage (development) and Cloudinary via `multer-storage-cloudinary` (production)
- **Testing**: Jest, Supertest, `mongodb-memory-server`
- **CI/CD**: GitHub Actions

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router v7
- **Real-Time Client**: `socket.io-client` with React Context (`SocketContext`)
- **Icons**: Lucide React

---

## 📁 Project Structure

```text
Connectify/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Automated GitHub Actions test pipeline
├── client/                         # React 19 Vite frontend
│   ├── src/
│   │   ├── components/             # Navbar (with notifications bell), CreatePost
│   │   ├── context/                # SocketContext with useSocket hook
│   │   ├── pages/                  # Auth, Feed
│   │   ├── App.jsx
│   │   └── config.js
│   ├── package.json
│   └── vite.config.js
├── src/                            # Express backend source
│   ├── config/
│   │   ├── cloudinary.js           # Cloudinary SDK configuration
│   │   └── db.js                   # Mongoose connection logic
│   ├── controllers/
│   │   ├── authController.js       # Signup, login, logout handlers
│   │   ├── notificationController.js # Notification REST handlers
│   │   ├── postController.js       # Posts CRUD, atomic likes, comments, feed
│   │   └── userController.js       # Follow and unfollow handlers
│   ├── middlewares/
│   │   ├── authmiddleware.js       # JWT header verification
│   │   ├── upload.js               # Multer image storage and MIME filter
│   │   └── validate.js             # Reusable Zod schema validator
│   ├── models/
│   │   ├── comment.js              # Comment schema with compound index
│   │   ├── follow.js               # Follow schema with unique compound index
│   │   ├── notification.js         # Notification schema with compound index
│   │   ├── post.js                 # Post schema with compound index
│   │   └── User.js                 # User schema
│   ├── routes/
│   │   ├── auth.js                 # /api/auth routes
│   │   ├── comments.js             # /api/comments routes
│   │   ├── notifications.js        # /api/notifications routes
│   │   ├── posts.js                # /api/posts and /api/feed routes
│   │   └── users.js                # /api/users follow routes
│   ├── validations/
│   │   └── schemas.js              # Zod validation schemas
│   └── socket.js                   # Socket.IO initialization & JWT handshake auth
├── tests/                          # Automated integration test suites
│   ├── auth.test.js                # Auth, registration, token rejection
│   ├── comments.test.js            # Comment CRUD, author-only deletion
│   ├── follow_feed.test.js         # Follow rules, cursor feed pagination
│   ├── notifications.test.js       # Notification REST & live Socket.IO delivery
│   ├── posts.test.js               # Post creation, atomic likes, pagination
│   └── setup.js                    # In-memory test DB lifecycle
├── app.js                          # Express application & HTTP server setup
├── jest.config.js                  # Jest test environment configuration
├── package.json                    # Backend dependencies & npm scripts
├── .env.example                    # Environment variable template
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | Optional | Port for the backend server (defaults to 8080) | `8080` |
| `NODE_ENV` | Optional | Runtime mode (`development`, `production`, `test`) | `development` |
| `FRONTEND_URL` | Optional | Allowed CORS origin for client requests | `http://localhost:5173` |
| `MONGODB_URL` | **Yes** | MongoDB connection URI | `mongodb://localhost:27017/connectify` |
| `DB_NAME` | Optional | Target MongoDB database name | `connectify` |
| `JWT_SECRET` | **Yes** | Secret key for signing and verifying JWTs | `your_jwt_secret_key` |
| `CLOUDINARY_CLOUD_NAME`| Prod only| Cloudinary cloud name for image uploads | `your_cloud_name` |
| `CLOUDINARY_API_KEY`   | Prod only| Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Prod only| Cloudinary API secret | `your_api_secret` |

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api` (except `/health`). Protected endpoints require the `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| `GET` | `/health` | No | Server health check |
| `POST` | `/api/auth/signup` | No | Register a new user (validated with Zod) |
| `POST` | `/api/auth/login` | No | Authenticate user and receive JWT token (validated with Zod) |
| `POST` | `/api/auth/logout` | **Yes** | Invalidate user session |
| `GET` | `/api/posts` | **Yes** | Fetch paginated posts (`page`, `limit`) |
| `POST` | `/api/posts` | **Yes** | Create post with optional image (5 MB limit, Zod-validated) |
| `DELETE` | `/api/posts/:id` | **Yes** | Delete own post by ID (author only) |
| `POST` | `/api/posts/:id/like` | **Yes** | Atomically toggle like using `$addToSet` and `$pull` |
| `GET` | `/api/posts/:id/comments` | **Yes** | List paginated comments on a post (`page`, `limit`) |
| `POST` | `/api/posts/:id/comments` | **Yes** | Add comment to a post (Zod-validated) |
| `DELETE` | `/api/comments/:id` | **Yes** | Delete own comment (author only; `$pull` from post) |
| `GET` | `/api/feed` | **Yes** | Posts from followed users via cursor-based pagination |
| `POST` | `/api/users/:id/follow` | **Yes** | Follow a user (enforces unique follow & rejects self-follow) |
| `POST` | `/api/users/:id/unfollow` | **Yes** | Unfollow a user |
| `GET` | `/api/notifications` | **Yes** | List paginated notifications for current user with `unreadCount` |
| `PATCH` | `/api/notifications/:id/read` | **Yes** | Mark single notification as read (recipient only) |
| `PATCH` | `/api/notifications/read-all` | **Yes** | Mark all notifications as read for current user |

---

## ⚡ Real-Time Socket.IO Architecture

### 1. Connection & Authentication
- Socket.IO attaches to the same HTTP server as Express and shares CORS configuration.
- Every socket handshake is authenticated with the same JWT used by the REST API:
  ```javascript
  // Client connection
  import { io } from "socket.io-client";
  const socket = io("http://localhost:8080", {
    auth: { token: localStorage.getItem("token") }
  });
  ```
- Unauthenticated socket connections are immediately rejected.
- The server never trusts client-provided user IDs. Upon successful verification, the socket automatically joins a private room: `user:<decodedUserId>`.

### 2. Socket Event: `notification`
- **Room**: `user:<recipientId>`
- **Event Name**: `notification`
- **Payload Shape**:
  ```json
  {
    "_id": "67329fa9c1a0123456789abc",
    "recipient": "67329fa9c2b0123456789def",
    "actor": {
      "_id": "67329fa9c3c0123456789ghi",
      "username": "alex"
    },
    "type": "like",
    "post": "67329fa9c4d0123456789jkl",
    "read": false,
    "createdAt": "2026-11-12T01:21:00.000Z",
    "updatedAt": "2026-11-12T01:21:00.000Z"
  }
  ```
  *(Types supported: `"like"`, `"comment"`, `"follow"`)*

---

## 📐 System Design Notes

### 1. Database as the Source of Truth (Socket.IO as Ephemeral Transport)
Real-time web applications must be resilient to dropped connections and offline users. In Connectify:
1. Every event (`like`, `comment`, `follow`) writes to the MongoDB `Notification` collection first.
2. Only after durable persistence does the server push the notification to `user:<recipientId>`.
3. If the recipient is offline or the socket emission fails, the notification remains in MongoDB and is delivered whenever the user queries `GET /api/notifications`.
4. Self-actions (`actor.equals(recipient)`) are explicitly filtered out.

### 2. Cursor-Based Pagination on the Feed
While standard posts use offset/limit pagination, the personalized feed (`/api/feed`) implements cursor-based pagination on `createdAt`:
- **The Problem with Offset Pagination**: In a real-time social feed where new posts are frequently created, standard `offset = (page - 1) * limit` leads to duplicate posts or skipped posts across page fetches.
- **The Solution**: Clients pass a `cursor` (the `createdAt` timestamp of the oldest post currently visible). The database query uses `createdAt: { $lt: cursor }`, guaranteeing deterministic page transitions regardless of how many new posts were published in the interim.

### 3. Database Constraints & Atomic Operations
- **Atomic Likes**: Rapid double-taps on posts are protected against race conditions using MongoDB's atomic `$addToSet` (to like) and `$pull` (to unlike) operators directly in `findOneAndUpdate`. This prevents in-memory read-modify-write race conditions.
- **Unique Follows**: The `Follow` collection enforces `{ follower: 1, following: 1 }` as a unique compound index, guaranteeing that duplicate follows are impossible at the database level.
- **Performance Indexes**: Compound indexes `{ author: 1, createdAt: -1 }` on Posts, `{ post: 1, createdAt: -1 }` on Comments, and `{ recipient: 1, createdAt: -1 }` on Notifications eliminate in-memory sorting and maximize index-covered queries.

---

## 🧪 Running Tests

Tests run against an isolated in-memory MongoDB server (`mongodb-memory-server`) to ensure zero side effects on production or local databases.

```bash
# Run all 40 integration tests across all 5 suites
npm test
```

### GitHub Actions CI
Every commit pushed or pull request opened automatically triggers our CI workflow defined in `.github/workflows/ci.yml`, running clean dependency installation (`npm ci`) and the full Jest test suite on Ubuntu.

---

## 🚀 Local Development Setup

### 1. Clone & Install Backend
```bash
git clone https://github.com/Palak216/mini-instagram-backend.git
cd mini-instagram-backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MONGODB_URL and JWT_SECRET
```

### 3. Start Backend
```bash
npm start
# Server listens at http://localhost:8080
```

### 4. Start React Frontend
```bash
cd client
npm install
npm run dev
# Vite dev server runs at http://localhost:5173
```
