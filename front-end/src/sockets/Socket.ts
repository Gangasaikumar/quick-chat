import { io, Socket } from "socket.io-client";

export const socket: Socket = io("/", {
  withCredentials: true,
  query: {
    token: localStorage.getItem("token"),
  },
  autoConnect: false,
});
