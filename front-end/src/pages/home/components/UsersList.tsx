import { useDispatch, useSelector } from "react-redux";
import { store, type RootState } from "../../../redux-store/store";
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
import { useEffect } from "react";
import { socket } from "../../../sockets/Socket";

const UsersList = ({
  searchKey,
  clearSearchKey,
}: {
  searchKey: string;
  clearSearchKey: () => void;
}) => {
  const { allUsers, allChats, loggedUserData, selectedChat, onlineUsers } =
    useSelector((state: RootState) => state.userData);
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
    return moment(chat?.lastMessage?.createdAt, "YYYY-MM-DD HH:mm:ss").format(
      "LT",
    );
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

  useEffect(() => {
    socket.off("message-count").on("message-count", (message) => {
      let tempAllChats = allChats;
      if (selectedChat._id != message.chatId) {
        const updatedAllChats = allChats.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              lastMessage: message,
              unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
            };
          }
          return chat;
        });
        tempAllChats = updatedAllChats;
      }
      //  find the latest chat
      const latestChat = tempAllChats.find(
        (chat) => chat._id === message.chatId,
      );
      // get all other chats
      const otherChats = tempAllChats.filter(
        (chat) => chat._id != message.chatId,
      );
      // create new array latest chat on top & then other chats
      tempAllChats = [latestChat as ChatState, ...otherChats];
      dispatch(setAllChats(tempAllChats));
    });
  }, []);

  return (
    <div className="user-list">
      {getSortedData().map((user: UserState, index: number) => (
        <div
          className={
            "chat-user" +
            (IsSelectedChat(user._id) ? " selected-user" : " filtered-user")
          }
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenChat(user._id);
          }}
        >
          <div className="filter-user-display">
            {user.profilePic && user.profilePic.trim() !== "" ? (
              <img
                src={user.profilePic}
                alt="Profile Pic"
                className="user-profile-image"
                style={
                  onlineUsers?.includes(user._id)
                    ? { border: "4px solid #82e0aa", lineHeight: "42px" }
                    : {}
                }
              />
            ) : (
              <div
                className={
                  IsSelectedChat(user._id)
                    ? "user-selected-avatar"
                    : "user-default-avatar"
                }
                style={
                  onlineUsers?.includes(user._id)
                    ? { border: "4px solid #82e0aa", lineHeight: "42px" }
                    : {}
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
