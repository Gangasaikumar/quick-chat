import express, { type Request } from "express";
import {
  authMiddleware,
  getAllUsers,
  getUser,
  loginController,
  signupController,
  uploadProfilePic,
} from "../controllers/authController.ts";
import {
  createChat,
  getAllChats,
  clearUnreadMessages,
} from "../controllers/chatController.ts";
import {
  createMessage,
  getAllMessages,
} from "../controllers/messagesController.ts";
import { upload } from "../utils/upload.ts";

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

// Create an Express Router instance
const routes = express.Router();

routes.post("/signup", signupController);
routes.post("/login", loginController);
routes.get("/get-logged-user", authMiddleware, getUser);
routes.get("/get-all-users", authMiddleware, getAllUsers);
routes.post(
  "/upload-profile-pic",
  authMiddleware,
  upload.single("image"),
  uploadProfilePic,
);

routes.post("/create-new-chat", authMiddleware, createChat);
routes.get("/get-all-chats", authMiddleware, getAllChats);
routes.post("/clear-unread-messages", authMiddleware, clearUnreadMessages);

routes.post("/new-message", authMiddleware, createMessage);
routes.get("/get-all-messages/:chatId", authMiddleware, getAllMessages);

export default routes;
