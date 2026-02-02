import { useSelector } from "react-redux";
import type { RootState } from "../../../redux-store/store";
import { formatUserName, getInitials } from "../../../utils/Helpers";
import { useNavigate } from "react-router";
import { socket } from "../../../sockets/Socket";

const Header = () => {
  const userData = useSelector(
    (state: RootState) => state.userData.loggedUserData,
  );
  const navigate = useNavigate();
  const logoutUser = () => {
    localStorage.clear();
    socket.emit("user-offline", userData._id);
    navigate("/login");
  };
  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments" aria-hidden="true"></i>
        Quick Chat
      </div>
      <div className="app-user-profile-container">
        <div className="app-user-profile" onClick={() => navigate("/profile")}>
          <div className="logged-user-name">{formatUserName(userData)}</div>
          <div className="logged-user-profile-pic">
            {userData.profilePic && userData.profilePic.trim() !== "" ? (
              <img src={userData.profilePic} alt="Profile" />
            ) : (
              <div className="logged-user-profile-pic">
                {getInitials(userData)}
              </div>
            )}
          </div>
        </div>
        <button onClick={logoutUser}>
          <i className="fa fa-power-off" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
};

export default Header;
