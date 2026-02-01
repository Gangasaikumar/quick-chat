import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { useEffect } from "react";
import { socket } from "../../sockets/Socket";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux-store/store";

const Home = () => {
  const { loggedUserData } = useSelector((state: RootState) => state.userData);
  useEffect(() => {
    console.log("login user data::", loggedUserData._id);
    socket.emit("join-room", loggedUserData._id);
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
