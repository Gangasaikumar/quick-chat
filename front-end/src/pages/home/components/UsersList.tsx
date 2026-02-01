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
import moment from "moment";
import { formatUserName, getInitials } from "../../../utils/Helpers";

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

  const getLastMessage = (user: UserState) => {
    const chat = allChats?.find((chat) =>
      chat.members?.map((m) => m._id)?.includes(user._id),
    );
    const isYou =
      chat?.lastMessage?.sender === loggedUserData._id ||
      chat?.lastMessage?.sender === loggedUserData._id;

    const lastMsg = chat?.lastMessage?.text ?? user.email ?? "";
    const finalPrefix =
      lastMsg.length > 25 ? `${lastMsg.slice(0, 25)}...` : lastMsg;
    return isYou ? `You: ${finalPrefix}` : finalPrefix;
  };

  const getLastMessageTimeStamp = (user: UserState) => {
    const chat = allChats?.find((chat) =>
      chat.members?.map((m) => m._id)?.includes(user._id),
    );

    if (!chat?.lastMessage?.createdAt) return;
    return moment(chat?.lastMessage?.createdAt).format("LT");
  };

  const getUnreadMessageCount = (user: UserState) => {
    const chat = allChats?.find((chat) =>
      chat.members?.map((m) => m._id)?.includes(user._id),
    );
    if (
      chat &&
      chat?.unreadMessageCount &&
      chat?.lastMessage?.sender !== loggedUserData._id
    ) {
      return chat?.unreadMessageCount;
    } else {
      return 0;
    }
  };

  const getSortedData = (): UserState[] => {
    if (searchKey === "") {
      return allChats
        .map((eachChat) =>
          eachChat?.members?.find((mem) => mem._id !== loggedUserData._id),
        )
        .filter((user): user is UserState => user !== undefined);
    } else {
      return allUsers.filter((user) => {
        return (
          user.firstName?.toLowerCase().includes(searchKey?.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchKey?.toLowerCase())
        );
      });
    }
  };

  return (
    <div className="user-list">
      {getSortedData().map((user: UserState) => (
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
                {getInitials(user)}
              </div>
            )}
            <div className="filter-user-details">
              <div className="user-display-name">{formatUserName(user)}</div>
              <div className="user-display-email">{getLastMessage(user)}</div>
            </div>
            <div
              className="user-last-chat-details"
              style={{
                alignSelf:
                  getUnreadMessageCount(user) > 0 ? "center" : "flex-start",
              }}
            >
              {getUnreadMessageCount(user) > 0 && (
                <div className="unread-message-count">
                  {getUnreadMessageCount(user)}
                </div>
              )}
              <div className="last-message-timestamp">
                {getLastMessageTimeStamp(user)}
              </div>
            </div>
            {!allChats.some((chat: ChatState) =>
              chat?.members?.some((m) => m._id === user._id),
            ) && (
              <div className="user-start-chat">
                <button
                  className="user-start-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateNewChat(user);
                  }}
                >
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
