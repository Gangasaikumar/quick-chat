import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./routes.tsx";
import { RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./redux-store/store.ts";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
