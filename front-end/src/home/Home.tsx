import Loader from "../components/Loader";
import {useSelector } from "react-redux";
import type { RootState } from "../redux-store/store";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

const Home = () => {
  const loader = useSelector((state: RootState) => state.loader as boolean);
  return (
    <>
      {loader && <Loader />}
      <div className="home-page">
        <Header />
        <div className="main-content">
         <Sidebar />
         {/* <!--CHAT AREA LAYOUT--> */ }
        </div>
      </div>
    </>
  );
};

export default Home;
