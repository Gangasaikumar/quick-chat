import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { useEffect } from "react";
import { socket } from "../../sockets/Socket";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux-store/store";
import { setOnlineUsers } from "../../redux-store/userSlice";
import Loader from "../../components/Loader";

const Home = () => {
  const { loggedUserData } = useSelector((state: RootState) => state.userData);
  const { onlineUsers } = useSelector((state: RootState) => state.userData);
  const loader = useSelector((state: RootState) => state.loader);
  const dispatch = useDispatch();
  useEffect(() => {
    if (loggedUserData._id) {
      console.log("login user data::", loggedUserData._id);
      socket.emit("join-room", loggedUserData._id);
      socket.emit("user-online", loggedUserData._id);
      socket.on("online-users", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
    }
    return () => {};
  }, [loggedUserData._id, onlineUsers]);
  return (
    <>
      {loader && <Loader />}
      <div className="home-page">
        <Header />
        <div className="main-content">
          <Sidebar />
          {/* <!--CHAT AREA LAYOUT--> */}
          <ChatArea />
        </div>
      </div>
    </>
  );
};

export default Home;
