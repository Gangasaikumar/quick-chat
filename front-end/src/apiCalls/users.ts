import { AxiosError } from "axios";
import { axiosInstance } from "./intercepter";

const getLoginUserData = async () => {
  try {
    const responce = await axiosInstance.get("/api/get-logged-user", {
      withCredentials: true,
    });
    return responce.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return error?.response?.data;
    }
    throw error;
  }
};

export { getLoginUserData };
