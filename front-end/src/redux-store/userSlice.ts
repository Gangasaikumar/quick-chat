import { createSlice } from "@reduxjs/toolkit";
import type { SignupUser } from "../apiCalls/auth";

type UserState = SignupUser & {
 profilePic?:string
};
const initialState: UserState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, action) => {
      return action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
