import { createBrowserRouter } from "react-router";
import Home from "./home/Home";
import Login from "./login/Login";
import Signup from "./signup/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element:<ProtectedRoute><Home /></ProtectedRoute>,
    children:[
      {
        path:"/home",
        element:<ProtectedRoute><Home /></ProtectedRoute>
      }
    ]
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;
