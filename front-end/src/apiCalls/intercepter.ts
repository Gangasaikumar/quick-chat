import axios from "axios";

export const axiosInstance = axios.create({
  //   headers: {
  //     Origin: "http://localhost:3000",
  //   },
  baseURL: "/", // 👈 IMPORTANT for Vite proxy
  withCredentials: true,
});
