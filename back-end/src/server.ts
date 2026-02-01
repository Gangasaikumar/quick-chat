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
app.use(express.json());
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

io.on("connection", (socket) => {
  socket.on("connect", (msg) => {
    console.log("User connected:", socket.id);
  });
  socket.on("join-room", (userId) => {
    socket.join(userId);
    console.log("User joined room:", userId);
  });

  socket.on("send-message", (message) => {
    io.to(message.members[0])
      .to(message.members[1])
      .emit("receive-message", message);
  });

  socket.on("clear-unread-messages", (message) => {
    io.to(message.members[0])
      .to(message.members[1])
      .emit("message-count-cleared", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
