import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux-store/store";
import {
  setAllChats,
  setSelectedChat,
  type ChatState,
  type UserState,
} from "../../redux-store/userSlice";
import { createNewChat } from "../../apiCalls/Chats";
import { hideLoader, showLoader } from "../../redux-store/loaderSlice";
import toast from "react-hot-toast";

const UsersList = ({ searchKey }: { searchKey: string }) => {
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
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleOpenChat = (chatId: string) => {
    const chat = allChats.find(
      (chat) =>
        chat.members?.map((m) => m._id)?.includes(chatId) &&
        chat.members?.map((m) => m._id)?.includes(loggedUserData._id),
    );
    if (chat) {
      dispatch(setSelectedChat(chat));
    }
  };

  return (
    <>
      {allUsers
        .filter((user: UserState) => {
          return (
            ((user.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
              user.lastName.toLowerCase().includes(searchKey.toLowerCase())) &&
              searchKey) ||
            allChats.some((chat) =>
              chat.members?.map((m) => m._id)?.includes(user._id),
            )
          );
        })
        .map((user: UserState) => (
          <div
            className={
              selectedChat?.members?.map((m) => m._id)?.includes(user._id)
                ? "selected-user"
                : "filtered-user"
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
                    selectedChat?.members?.map((m) => m._id)?.includes(user._id)
                      ? "user-selected-avatar"
                      : "user-default-avatar"
                  }
                >
                  {user.firstName[0].toUpperCase() +
                    user?.lastName?.[0].toUpperCase() || "N/A"}
                </div>
              )}
              <div className="filter-user-details">
                <div className="user-display-name">
                  {user.firstName + " " + user.lastName}
                </div>
                <div className="user-display-email">{user.email}</div>
              </div>

              <div className="user-start-chat">
                {!allChats.find((chat: ChatState) =>
                  chat?.members?.map((m) => m._id)?.includes(user._id),
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
    </>
  );
};

export default UsersList;
