import { createSlice } from "@reduxjs/toolkit";

type LoaderState = boolean;
const initialState: LoaderState = false;

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    showLoader: () => {
      return true;
    },
    hideLoader: () => {
     return false;
    },
  },
});


export const { showLoader, hideLoader } = loaderSlice.actions;

export default loaderSlice.reducer;