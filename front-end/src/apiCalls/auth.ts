import { AxiosError } from "axios";
import { axiosInstance } from "./intercepter";

export interface SignupUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

const signupUserApi = async (userData: SignupUser) => {
  try {
    const responce = await axiosInstance.post(
      "/api/signup",
      { userData },
      { withCredentials: true }
    );
    return responce.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return error?.response?.data;
    }
    throw error;
  }
};

const loginUserApi = async (loginData: LoginUser) => {
  try {
    const responce = await axiosInstance.post(
      "/api/login",
      { loginData },
      { withCredentials: true }
    );
    return responce.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return error?.response?.data;
    }
    throw error;
  }
};

export { signupUserApi, loginUserApi };
