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

const getAllUsers = async () => {
  try {
    const responce = await axiosInstance.get("/api/get-all-users", {
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

const uploadProfilePic = async (image: File) => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    const responce = await axiosInstance.post(
      "/api/upload-profile-pic",
      formData,
      {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total!);
          console.log(percent);
        },
      },
    );
    return responce.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return error?.response?.data;
    }
    throw error;
  }
};

export { getLoginUserData, getAllUsers, uploadProfilePic };
