import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { RootState } from "../redux-store/store";
import { getAllUsers, getLoginUserData } from "../apiCalls/users";
import { hideLoader, showLoader } from "../redux-store/loaderSlice";
import { setAllChats, setAllUsers, setUser } from "../redux-store/userSlice";
import toast from "react-hot-toast";
import { getAllChats } from "../apiCalls/Chats";
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
  const allUsers = useSelector((state: RootState) => state.userData.allUsers);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getLoggedInUser = async () => {
    dispatch(showLoader());
    try {
      const userDataResponse = await getLoginUserData();
      if (userDataResponse.success) {
        dispatch(setUser(userDataResponse.data));
        await getAllUsersData();
        await getCurrentUserChats();
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

  const getAllUsersData = async () => {
    dispatch(showLoader());
    try {
      if (allUsers.length <= 0) {
        const usersResponse = await getAllUsers();
        if (usersResponse.success) {
          dispatch(setAllUsers(usersResponse.data));
        } else {
          toast.error(usersResponse.message);
        }
      } else {
        return;
      }
    } catch {
      toast.error("An error occurred while fetching users.");
    } finally {
      dispatch(hideLoader());
    }
  };

  const getCurrentUserChats = async () => {
    dispatch(showLoader());
    try {
      const chatsResponse = await getAllChats();
      if (chatsResponse.success) {
        dispatch(setAllChats(chatsResponse.data));
      } else {
        toast.error(chatsResponse.message);
      }
    } catch {
      // navigate("/login");
      toast.error("An error occurred while fetching chats.");
    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    if (localStorage.getItem("isLogin")) {
      getLoggedInUser();
    } else {
      navigate("/login");
    }
  }, []);

  return <>{props.children}</>;
};

export default ProtectedRoute;
