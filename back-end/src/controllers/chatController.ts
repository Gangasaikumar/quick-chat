import { chatSchema } from "../database/models/chatSchema.ts";
import { userSchema } from "../database/models/usersSchema.ts";
import { getDb } from "../database/mongodb.ts";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../routes/routes.ts";

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

const getAllChars = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");
    if (!db.models.users) {
      db.model("users", userSchema);
    }
    const Chats = db.models.chats || db.model("chats", chatSchema);
    const allChats = await Chats.find({
      members: { $in: req?.user?.userId },
    })
      .populate("members")
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
export { createChat, getAllChars };
