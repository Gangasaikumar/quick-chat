import { chatSchema } from "../database/models/chatSchema.ts";
import { userSchema } from "../database/models/usersSchema.ts";
import { getDb } from "../database/mongodb.ts";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../routes/routes.ts";
import { messageSchema } from "../database/models/messageSchema.ts";

const createChat = async (req: Request, res: Response) => {
  try {
    // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");
    if (!db.models.users) {
      db.model("users", userSchema);
    }
    const Chats = db.models.chats || (await db.model("chats", chatSchema));
    const chat = new Chats(req.body);
    const savedChat = await chat.save();
    await savedChat.populate("members");
    res.status(201).send({
      message: "chat created sucessfully.!",
      success: true,
      data: savedChat,
    });
  } catch (error: unknown) {
    console.error("create-chat error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

const getAllChats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");
    if (!db.models.users) {
      db.model("users", userSchema);
    }

    if (!db.models.chats) {
      db.model("chats", chatSchema);
    }

    if (!db.models.messages) {
      db.model("messages", messageSchema);
    }

    const Chats = db.models.chats || db.model("chats", chatSchema);
    const allChats = await Chats.find({
      members: { $in: req?.user?.userId },
    })
      .populate("members")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    res.status(200).send({
      message: "chat fetched sucessfully.!",
      success: true,
      data: allChats,
    });
  } catch (error: unknown) {
    console.error("get-all-chat error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

const clearUnreadMessages = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { chatId } = req.body;
    if (!chatId) {
      return res.status(400).send({
        message: "Chat ID is required.!",
        success: false,
      });
    }
    // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");

    if (!db.models.chats) {
      db.model("chats", chatSchema);
    }

    if (!db.models.messages) {
      db.model("messages", messageSchema);
    }

    if (!db.models.users) {
      db.model("users", userSchema);
    }

    const Chats = db.models.chats || db.model("chats", chatSchema);
    const chat = await Chats.findById(chatId);
    if (!chat) {
      return res.status(404).send({
        message: "No chat found with given chat ID.!",
        success: false,
      });
    }
    const updatedChat = await Chats.findByIdAndUpdate(
      chatId,
      { unreadMessageCount: 0 },
      { new: true },
    )
      .populate("members")
      .populate("lastMessage");
    const Messages = db.models.messages || db.model("messages", messageSchema);
    await Messages.updateMany(
      { chatId: chatId, read: false, sender: { $ne: req.user?.userId } },
      { $set: { read: true } },
    );
    res.status(200).send({
      message: "Unread messages cleared sucessfully.!",
      success: true,
      data: updatedChat,
    });
  } catch (error: unknown) {
    console.error("get-all-chat error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};
export { createChat, getAllChats, clearUnreadMessages };
