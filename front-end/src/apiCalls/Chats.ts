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
export { getAllChats, createNewChat };
