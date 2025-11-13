import { useSelector } from "react-redux";
import type { RootState } from "../../redux-store/store";
import type { SignupUser } from "../../apiCalls/auth";

const Header = () => {
  const userData: SignupUser = useSelector((state: RootState) => state.userData);

  const firstName = userData?.firstName ?? "";
  const lastName =userData?.lastName ?? "";
  const fullName =firstName+" "+lastName;
  const displayName = fullName ?? 'Guest';
  const initials = userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'G';

  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments" aria-hidden="true"></i>
        Quick Chat
      </div>
      <div className="app-user-profile">
        <div className="logged-user-name">{displayName}</div>
        <div className="logged-user-profile-pic">{initials}</div>
      </div>
    </div>
  );
};

export default Header;
