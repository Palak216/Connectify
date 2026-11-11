# Connectify

Connectify is a full-stack social media application built with Node.js, Express, MongoDB, and React. It allows users to register, log in, create posts with optional image uploads, like posts, and leave comments.

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
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs`
- **File Uploads**: Multer with disk storage (development) and Cloudinary via `multer-storage-cloudinary` (production)
- **Security & Utilities**: CORS, dotenv

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router v7
- **Icons**: Lucide React

---

## 📁 Project Structure

```text
Connectify/
├── client/                         # React frontend client
│   ├── public/
│   ├── src/
│   │   ├── components/             # Navbar, CreatePost
│   │   ├── pages/                  # Auth, Feed
│   │   ├── App.jsx
│   │   └── config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── src/                            # Express backend source
│   ├── config/
│   │   ├── cloudinary.js           # Cloudinary configuration
│   │   └── db.js                   # Mongoose database connection
│   ├── controllers/
│   │   ├── authController.js       # Signup, login, and logout handlers
│   │   └── postController.js       # Post CRUD, likes, comments handlers
│   ├── middlewares/
│   │   ├── authmiddleware.js       # JWT authentication verification
│   │   └── upload.js               # Multer image storage and validation
│   ├── models/
│   │   ├── comment.js              # Comment schema
│   │   ├── post.js                 # Post schema
│   │   └── User.js                 # User schema
│   └── routes/
│       ├── auth.js                 # Auth route definitions
│       └── posts.js                # Post route definitions
├── app.js                          # Express application setup and entry point
├── package.json                    # Backend dependencies and scripts
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
| `NODE_ENV` | Optional | Runtime mode (`development` or `production`) | `development` |
| `FRONTEND_URL` | Optional | Allowed CORS origin for client requests | `http://localhost:5173` |
| `MONGODB_URL` | **Yes** | MongoDB connection URI | `mongodb://localhost:27017/connectify` |
| `DB_NAME` | Optional | Target MongoDB database name | `connectify` |
| `JWT_SECRET` | **Yes** | Secret key for signing and verifying JWTs | `your_jwt_secret_key` |
| `CLOUDINARY_CLOUD_NAME`| Prod only| Cloudinary cloud name for image uploads | `your_cloud_name` |
| `CLOUDINARY_API_KEY`   | Prod only| Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Prod only| Cloudinary API secret | `your_api_secret` |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally or a MongoDB Atlas connection string

### 2. Backend Setup

```bash
# Clone the repository
git clone https://github.com/Palak216/mini-instagram-backend.git
cd mini-instagram-backend

# Install backend dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MONGODB_URL and JWT_SECRET

# Start backend server
npm start
```
The backend starts at `http://localhost:8080`.

### 3. Frontend Setup

```bash
# From the project root, navigate to the client folder
cd client

# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```
The client runs at `http://localhost:5173`.

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api` (except `/health`). Protected endpoints require the `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| `GET` | `/health` | No | Health check endpoint |
| `POST` | `/api/auth/signup` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Authenticate user and receive JWT token |
| `POST` | `/api/auth/logout` | **Yes** | Log out current user session |
| `GET` | `/api/posts` | **Yes** | Fetch all posts sorted newest first |
| `POST` | `/api/posts` | **Yes** | Create a post (optional multipart `image`, 5 MB max) |
| `DELETE` | `/api/posts/:id` | **Yes** | Delete a post by ID (author only) |
| `POST` | `/api/posts/:id/like` | **Yes** | Toggle like on a post |
| `POST` | `/api/posts/:id/comments` | **Yes** | Add a comment to a post |

---

## 🔒 Security Measures

- **Password Protection**: Passwords are hashed with `bcryptjs` using a salt work factor of 10 prior to storage.
- **Stateless Authentication**: Protected API endpoints enforce JWT signature verification via Bearer token authorization headers.
- **Upload Restrictions**: Multer restricts image uploads to a maximum size of 5 MB and verifies MIME types and extensions (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`).
- **Resource Authorization**: Deletion of posts strictly verifies that the authenticated user (`req.user.id`) matches the post's author ID.
