import { useSelector } from "react-redux";
import type { RootState } from "../../../redux-store/store";
import type { SignupUser } from "../../../apiCalls/auth";
import { formatUserName, getInitials } from "../../../utils/Helpers";

const Header = () => {
  const userData: SignupUser = useSelector(
    (state: RootState) => state.userData.loggedUserData,
  );

  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments" aria-hidden="true"></i>
        Quick Chat
      </div>
      <div className="app-user-profile">
        <div className="logged-user-name">{formatUserName(userData)}</div>
        <div className="logged-user-profile-pic">{getInitials(userData)}</div>
      </div>
    </div>
  );
};

export default Header;
