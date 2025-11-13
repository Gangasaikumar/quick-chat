import express, { type Request } from "express";
import {
    authMiddleware,
  getAllUsers,
  getUser,
  loginController,
  signupController,
} from "../controllers/authController.ts";
import { createChat, getAllChars } from "../controllers/chatController.ts";
import { createMessage, getAllMessages } from "../controllers/messagesController.ts";

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

// Create an Express Router instance
const routes = express.Router();

routes.post("/signup", signupController);
routes.post("/login", loginController);
routes.get("/get-logged-user", authMiddleware, getUser);
routes.get("/get-all-users", authMiddleware, getAllUsers);

routes.post("/create-new-chat", authMiddleware, createChat);
routes.get("/get-all-chats",authMiddleware, getAllChars );

routes.post("/new-message", authMiddleware, createMessage);
routes.get("/get-all-messages/:chatId",authMiddleware, getAllMessages );


export default routes;
