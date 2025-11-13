import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    members: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }] },
    lastMessage: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "messages" }],
    },
    unreadMessageCount: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

export { chatSchema };
