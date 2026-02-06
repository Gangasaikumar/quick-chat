import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { useEffect } from "react";
import { socket } from "../../sockets/Socket";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux-store/store";
import { setOnlineUsers } from "../../redux-store/userSlice";

const Home = () => {
  const { loggedUserData } = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  useEffect(() => {
    if (loggedUserData._id) {
      socket.emit("join-room", loggedUserData._id);
      socket.off("online-users").on("online-users", (updatedOnlineUsers) => {
        dispatch(setOnlineUsers(updatedOnlineUsers));
      });
    }
    return () => {};
  }, [loggedUserData._id]);

  return (
    <>
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
