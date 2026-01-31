import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../redux-store/store";
import {
  setAllChats,
  setSelectedChat,
  type ChatState,
  type UserState,
} from "../../../redux-store/userSlice";
import { hideLoader, showLoader } from "../../../redux-store/loaderSlice";
import toast from "react-hot-toast";
import { createNewChat } from "../../../apiCalls/Chats";

const UsersList = ({
  searchKey,
  clearSearchKey,
}: {
  searchKey: string;
  clearSearchKey: () => void;
}) => {
  const { allUsers, allChats, loggedUserData, selectedChat } = useSelector(
    (state: RootState) => state.userData,
  );
  const dispatch = useDispatch();

  const handleCreateNewChat = async (user: UserState) => {
    try {
      dispatch(showLoader());
      const response = await createNewChat([loggedUserData._id, user._id]);
      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        const updatedChat = [...allChats, newChat];
        dispatch(setAllChats(updatedChat));
        dispatch(setSelectedChat(newChat));
        clearSearchKey();
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleOpenChat = (chatId: string) => {
    const isAlreadyActiveChat = IsSelectedChat(chatId);
    if (isAlreadyActiveChat) {
      return;
    }
    const chat = allChats.find(
      (chat) =>
        chat.members?.map((m) => m._id)?.includes(chatId) &&
        chat.members?.map((m) => m._id)?.includes(loggedUserData._id),
    );
    if (chat) {
      dispatch(setSelectedChat(chat));
      clearSearchKey();
    }
  };

  const IsSelectedChat = (chatId: string) => {
    if (selectedChat._id) {
      return selectedChat.members?.map((m) => m._id)?.includes(chatId);
    }
    return false;
  };

  return (
    <div className="user-list">
      {allUsers
        .filter((user: UserState) => {
          return (
            ((user.firstName
              ?.toLowerCase()
              ?.includes(searchKey?.toLowerCase()) ||
              user.lastName
                ?.toLowerCase()
                ?.includes(searchKey?.toLowerCase())) &&
              searchKey) ||
            allChats.some((chat) =>
              chat.members?.some((m) => m._id === user._id),
            )
          );
        })
        .map((user: UserState) => (
          <div
            className={
              "chat-user" +
              (IsSelectedChat(user._id) ? " selected-user" : " filtered-user")
            }
            key={user._id}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenChat(user._id);
            }}
          >
            <div className="filter-user-display">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile Pic"
                  className="user-profile-image"
                />
              ) : (
                <div
                  className={
                    IsSelectedChat(user._id)
                      ? "user-selected-avatar"
                      : "user-default-avatar"
                  }
                >
                  {user.firstName.charAt(0)?.toUpperCase() +
                    user?.lastName.charAt(0)?.toUpperCase() || "N/A"}
                </div>
              )}
              <div className="filter-user-details">
                <div className="user-display-name">
                  {user.firstName + " " + user.lastName}
                </div>
                <div className="user-display-email">{user.email}</div>
              </div>

              <div className="user-start-chat">
                {!allChats.some((chat: ChatState) =>
                  chat?.members?.some((m) => m._id === user._id),
                ) && (
                  <button
                    className="user-start-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateNewChat(user);
                    }}
                  >
                    Start Chat
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default UsersList;
