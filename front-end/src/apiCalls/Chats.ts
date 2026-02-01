import { axiosInstance } from "./intercepter";

const getAllChats = async () => {
  try {
    const response = await axiosInstance.get("/api/get-all-chats");
    return response.data;
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};

const createNewChat = async (members: string[]) => {
  try {
    const response = await axiosInstance.post("/api/create-new-chat", {
      members,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};
const clearUnReadMessageCount = async (chatId: string | undefined) => {
  try {
    const response = await axiosInstance.post("/api/clear-unread-messages", {
      chatId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};
export { getAllChats, createNewChat, clearUnReadMessageCount };
