import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import routes from "./routes/routes.ts";
import http from "node:http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// Disable etag caching
app.set("etag", false);

// CORS setup for cookies
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:6281",
  "http://localhost:5173",
];
const methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: methods,
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // allow cookies
};

// Apply middlewares
app.use(cors(corsOptions));
app.use(
  express.json({
    limit: "50mb",
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (_req, res) => {
  res.send("<h1>Server is healthy!</h1>");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const onlineUser = new Set();

io.on("connection", (socket) => {
  socket.on("connect", (msg) => {
    console.log("User connected:", socket.id);
  });
  socket.on("join-room", (userId) => {
    socket.join(userId);
    console.log("User joined room:", userId);
  });

  socket.once("send-message", (message) => {
    io.to(message.members[0])
      .to(message.members[1])
      .emit("receive-message", message);

    io.to(message.members[0])
      .to(message.members[1])
      .emit("message-count", message);
  });

  socket.on("clear-unread-messages", (message) => {
    io.to(message.members[0])
      .to(message.members[1])
      .emit("message-count-cleared", message);
  });

  socket.on("typing", (message) => {
    io.to(message.members[0])
      .to(message.members[1])
      .emit("user-typing", message);
  });

  socket.on("user-online", (userId) => {
    onlineUser.add(userId);
    io.emit("online-users", Array.from(onlineUser));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("user-offline", (userId) => {
    onlineUser.delete(userId);
    io.emit("online-users", Array.from(onlineUser));
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
