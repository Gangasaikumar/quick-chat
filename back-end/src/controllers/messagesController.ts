import { chatSchema } from "../database/models/chatSchema.ts";
import { getDb } from "../database/mongodb.ts";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../routes/routes.ts";
import { messageSchema } from "../database/models/messageSchema.ts";

const createMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");
    const Message = db.models.messages || db.model("messages", messageSchema);
    const Chat = db.models.chats || db.model("chats", chatSchema);
    const message = new Message(req.body);
    const savedMessage = await message.save();
    // const currentChat =  await Chat.findById(req.body?.chatId);
    // currentChat.lastMessage= savedMessage._id;
    // await currentChat.save();
    await Chat.findOneAndUpdate(
      { _id: req.body.chatId },
      {
        lastMessage: savedMessage._id,
        $inc: { unreadMessageCount: 1 },
      }
    );
    res.status(201).send({
      message: "message sent sucessfully.!",
      success: true,
      data: savedMessage,
    });
  } catch (error: unknown) {
    console.error("create-message error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

const getAllMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
       // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");
    const Message = db.models.messages || db.model("messages", messageSchema);
    const allMessages = await Message.find({ chatId:req.params.chatId }).sort({ createdAt: 1});

    res.status(200).send({
      message: "messages fetched sucessfully.!",
      success: true,
      data: allMessages,
    });
  } catch (error: unknown) {
    console.error("get-all-messages error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};
export { createMessage, getAllMessages };
