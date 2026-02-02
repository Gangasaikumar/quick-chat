import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux-store/store";
import {
  formattedDate,
  formatUserName,
  getInitials,
} from "../../utils/Helpers";
import { useEffect, useState } from "react";
import { uploadProfilePic } from "../../apiCalls/users";
import { hideLoader, showLoader } from "../../redux-store/loaderSlice";
import toast from "react-hot-toast";
import { setUser } from "../../redux-store/userSlice";
import Loader from "../../components/Loader";

const Profile = () => {
  const { loggedUserData } = useSelector((state: RootState) => state.userData);
  const loader = useSelector((state: RootState) => state.loader);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profile, setProfile] = useState<File | null>(null);

  const dispatch = useDispatch();

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // validate
    if (!selectedFile.type.startsWith("image/")) {
      alert("Only images allowed");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("Max 2MB allowed");
      return;
    }

    setProfile(selectedFile);
    setProfilePic(URL.createObjectURL(selectedFile));
  };

  const handleUploadProfilePic = async () => {
    try {
      dispatch(showLoader());
      if (!profile) return;
      const responce = await uploadProfilePic(profile);
      if (responce.success) {
        toast.success(responce.message);
        dispatch(setUser(responce.data));
        dispatch(hideLoader());
      } else {
        toast.error(responce.message);
        dispatch(hideLoader());
      }
    } catch (error) {
      console.log("error::", error);
    }
  };

  useEffect(() => {
    if (loggedUserData?.profilePic) {
      setProfilePic(loggedUserData?.profilePic);
    }
  }, [loggedUserData.profilePic]);
  return (
    <>
      {loader && <Loader />}
      <div className="profile-page-container">
        <div className="profile-pic-container">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile Pic"
              className="user-profile-pic-upload"
            />
          ) : (
            <div className="user-default-profile-avatar">
              {getInitials(loggedUserData)}
            </div>
          )}
        </div>

        <div className="profile-info-container">
          <div className="user-profile-name">
            <h1>{formatUserName(loggedUserData)}</h1>
          </div>
          <div>
            <b>Email: </b>
            {loggedUserData?.email}
          </div>
          <div>
            <b>Account Created: </b>
            {formattedDate(loggedUserData?.createdAt)}
          </div>
          <div className="select-profile-pic-container">
            <input type="file" onChange={handleProfilePicChange} />
            <button
              className="upload-profile-pic-btn"
              onClick={handleUploadProfilePic}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
