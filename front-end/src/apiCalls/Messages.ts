import type { ChatState } from "../redux-store/userSlice";
import { axiosInstance } from "./intercepter";
export type messagePayload = {
  chatId?: string;
  sender: string;
  text: string;
  image?: string;
  createdAt?: string;
};
const createNewMessage = async (message: messagePayload) => {
  try {
    const response = await axiosInstance.post("/api/new-message", {
      ...message,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};

const getAllMessages = async (selectedChat: ChatState | null) => {
  try {
    const response = await axiosInstance.get(
      `/api/get-all-messages/${selectedChat?._id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};
export { createNewMessage, getAllMessages };
