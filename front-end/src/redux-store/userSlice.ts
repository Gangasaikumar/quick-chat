import { createSlice } from "@reduxjs/toolkit";
import type { SignupUser } from "../apiCalls/auth";

export type UserState = SignupUser & {
  _id: string;
  profilePic?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatState = {
  _id?: string;
  members?: UserState[];
  createdAt?: string;
  updatedAt?: string;
};
const initialState = {
  loggedUserData: {} as UserState,
  allUsers: [] as UserState[],
  allChats: [] as ChatState[],
  selectedChat: {} as ChatState,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, action) => {
      _state.loggedUserData = action.payload;
    },
    setAllUsers: (_state, action) => {
      _state.allUsers = action.payload;
    },
    setAllChats: (_state, action) => {
      _state.allChats = action.payload;
    },

    setSelectedChat: (_state, action) => {
      _state.selectedChat = action.payload;
    },
  },
});

export const { setUser, setAllUsers, setAllChats, setSelectedChat } =
  userSlice.actions;

export default userSlice.reducer;
