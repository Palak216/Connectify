# 📸 Mini Instagram — Connectify

A social media web application inspired by Instagram, built to provide a platform for users to register, log in, share posts, and interact with content.

## 🚀 Features

- 🔐 **User Authentication** — User registration and login.
- 📝 **Post Management** — Create and manage posts.
- 🖼️ **Image Uploads** — Image handling with Cloudinary and Multer.
- 👤 **User Accounts** — User-related functionality.
- 🌐 **REST API** — Backend endpoints built with Express.js.
- 🗄️ **Database Integration** — MongoDB with Mongoose.
- 🔒 **Password Security** — Password hashing using bcrypt.
- ⚙️ **Environment Configuration** — Sensitive configuration stored in environment variables.

## 🛠️ Tech Stack

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS

**Libraries and Tools**
- bcrypt / bcryptjs
- JSON Web Token (JWT)
- Express Session
- Multer
- Cloudinary
- dotenv
- CORS
- Cookie Parser

## 📁 Project Structure

```text
mini-instagram-backend/
├── client/
├── src/
│   ├── config/
│   │   └── db.js
│   └── routes/
│       ├── auth.js
│       └── posts.js
├── uploads/
├── app.js
├── index.js
├── package.json
├── package-lock.json
├── .env.example
└── README.md
```

*Note: The exact folders and files may vary as the project evolves.*

## ⚙️ Getting Started

### 1. Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [MongoDB](https://www.mongodb.com/) — local installation or MongoDB Atlas account
- A Cloudinary account if you use Cloudinary image uploads

### 2. Clone the Repository

```bash
git clone https://github.com/Palak216/mini-instagram-backend.git
cd mini-instagram-backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add the variables required by your application.

For example:

```env
PORT=8080
MONGODB_URL=your_mongodb_connection_string
```

Add any additional variables required by your authentication and Cloudinary configuration. Check `.env.example` for the exact variable names expected by your code.

**Important:** Never commit your real `.env` file, database credentials, API keys, or other secrets to GitHub.

### 5. Run the Application

```bash
npm start
```

The backend is configured to run locally at:

```text
http://127.0.0.1:8080
```

Make sure your database is accessible and the environment variables are configured correctly before starting the server.

## 🔌 API Routes

The application currently mounts these route groups:

| Route Prefix | Purpose |
|---|---|
| `/api/auth` | Authentication-related endpoints |
| `/api` | Post-related endpoints |

The exact endpoints and supported HTTP methods depend on the route definitions in the source code.

## 🔐 Security Notes

- Keep database credentials and API keys private.
- Use strong passwords and secure password hashing.
- Validate and sanitize user input.
- Restrict file uploads by file type and size.
- Configure CORS appropriately for your deployment environment.
- Use HTTPS and secure cookie settings in production.



## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Commit your changes.
5. Open a pull request.

## 👩‍💻 Author

**Palak Agrawal**

GitHub: [@Palak216](https://github.com/Palak216)
