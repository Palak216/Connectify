const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Origin not allowed by CORS"));
      },
      credentials: true,
    },
  });

  // Authenticate socket connections with JWT
  io.use((socket, next) => {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error("Server authentication is not configured"));
      }

      // Check handshake auth or authorization header
      let token = socket.handshake.auth?.token;
      if (!token && socket.handshake.headers?.authorization) {
        const header = socket.handshake.headers.authorization;
        if (header.startsWith("Bearer ")) {
          token = header.slice(7).trim();
        }
      }

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, secret);
      if (!decoded || !decoded.id) {
        return next(new Error("Authentication error: Invalid token"));
      }

      // Attach authenticated user to socket; never trust client-provided user ID
      socket.user = decoded;
      return next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      // Automatically leaves rooms upon disconnect
    });
  });

  return io;
};

const getIO = () => io;

// Emit notification to user room safely
const emitNotification = (recipientId, notification) => {
  try {
    if (io) {
      io.to(`user:${recipientId}`).emit("notification", notification);
    }
  } catch (error) {
    console.error("Socket emit failed:", error.message);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNotification,
};
