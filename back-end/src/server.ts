import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import routes from "./routes/routes.ts";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Security headers
app.use(helmet());

// ✅ Disable etag caching
app.set("etag", false);

// ✅ CORS setup for cookies
const allowedOrigins = ["http://localhost:3000", "http://localhost:6281", "http://localhost:5173"];
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // ✅ allow cookies
};

// ✅ Apply middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/api", routes);

// ✅ Health check
app.get("/health", (req, res) => {
  res.send("✅ Server is healthy!");
});

// ✅ Start server and connect DB
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
