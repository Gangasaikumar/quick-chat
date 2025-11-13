// ProtectedRoute.tsx
import { useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { RootState } from "../redux-store/store";
import { getLoginUserData } from "../apiCalls/users";
import { hideLoader, showLoader } from "../redux-store/loaderSlice";
import { setUser } from "../redux-store/userSlice";
import toast from "react-hot-toast";
import Loader from "./Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
  const isLoading = useSelector((state: RootState) => state.loader);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getLoggedInUser = async () => {
    dispatch(showLoader());
    if (!localStorage.getItem("isLogin")) {
      navigate("/login");
      dispatch(hideLoader());
      return;
    } 
    try {
      const userDataResponse = await getLoginUserData();
      if (userDataResponse.success) {
        dispatch(setUser(userDataResponse.data));
      } else {
        toast.error(userDataResponse.message);
        localStorage.removeItem("isLogin");
        navigate("/login");
      }
    } catch {
      toast.error("An error occurred during authentication.");
      localStorage.removeItem("isLogin");
      navigate("/login");
    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    getLoggedInUser();
  }, []);

  if (isLoading) {
    return <Loader />; 
  }

  return <>{props.children}</>;
};

export default ProtectedRoute;
