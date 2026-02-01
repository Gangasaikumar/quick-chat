import { useDispatch, useSelector } from "react-redux";
import { store, type RootState } from "../../../redux-store/store";
import { setAllChats, type UserState } from "../../../redux-store/userSlice";
import { hideLoader, showLoader } from "../../../redux-store/loaderSlice";
import {
  createNewMessage,
  getAllMessages,
  type messagePayload,
} from "../../../apiCalls/Messages";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useState, useEffect, useRef } from "react";
import moment from "moment";
import { formatUserName } from "../../../utils/Helpers";
import { clearUnReadMessageCount } from "../../../apiCalls/Chats";
import { socket } from "../../../sockets/Socket";
const ChatArea = () => {
  const { selectedChat, loggedUserData, allChats } = useSelector(
    (state: RootState) => state.userData,
  );
  const dispatch = useDispatch();
  const selectedChatMember = selectedChat?.members?.find(
    (member: UserState) => member._id != loggedUserData._id,
  );

  const [message, setMessage] = useState<string>("");
  const [allMessages, setAllMessages] = useState<
    (messagePayload & { read?: boolean })[]
  >([]);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = async () => {
    try {
      const newMessage: messagePayload = {
        chatId: selectedChat._id,
        sender: loggedUserData._id,
        text: message,
      };
      socket.emit("send-message", {
        ...newMessage,
        members: selectedChat.members?.map((member) => member._id),
        read: false,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
      const response = await createNewMessage(newMessage);
      if (response.success) {
        toast.success(response.message);
        setMessage("");
      } else {
        toast.error(response.message);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    }
  };

  const handleGetAllMessages = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllMessages(selectedChat);
      if (response.success) {
        setAllMessages(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleClearUnReadMessages = async () => {
    try {
      socket.emit("clear-unread-messages", {
        chatId: selectedChat._id,
        members: selectedChat.members?.map((member) => member._id),
      });
      const response = await clearUnReadMessageCount(selectedChat._id);
      if (response.success) {
        toast.success(response.message);
        allChats.map((chat) =>
          chat._id === selectedChat._id ? response.data : chat,
        );
        // dispatch(setAllChats([...allChats, updatedChat]));
      } else {
        toast.error(response.message);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  const isSender = (message: messagePayload) =>
    message.sender === loggedUserData._id;

  const formatTime = (time: string | Date) => {
    if (!time) return;
    const now = moment();
    const diff = now.diff(moment(time, "YYYY-MM-DD HH:mm:ss"), "days");
    if (diff < 1) {
      return `Today ${moment(time, "YYYY-MM-DD HH:mm:ss").format("hh:mm A")}`;
    } else if (diff === 1) {
      return `Yesterday ${moment(time, "YYYY-MM-DD HH:mm:ss").format(
        "hh:mm A",
      )}`;
    } else {
      return moment(time, "YYYY-MM-DD HH:mm:ss").format("MMM D, YYYY, hh:mm A");
    }
  };

  useEffect(() => {
    if (selectedChat._id) {
      socket.on("receive-message", (message) => {
        // const selectedChat = store.getState().userData.selectedChat;
        message.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
        if (selectedChat._id === message.chatId) {
          setAllMessages((prev) => [...prev, message]);
        }
        if (
          selectedChat._id === message.chatId &&
          message.sender != loggedUserData._id
        ) {
          handleClearUnReadMessages();
        }
      });

      socket.on("message-count-cleared", (message) => {
        // const selectedChat = store.getState().userData.selectedChat;
        // const allChats = store.getState().userData.allChats;
        if (selectedChat._id === message.chatId) {
          // UPDATING UNREAD MESSAGE COUNT
          const updatedChats = allChats.map((chat) => {
            if (chat._id === message.chatId) {
              return {
                ...chat,
                unreadCount: 0,
              };
            }
            return chat;
          });
          dispatch(setAllChats(updatedChats));
          // UPDATE READ MESAGE IN ALL MESSAGES
          setAllMessages((prev) => {
            return prev.map((message) => {
              return {
                ...message,
                read: true,
              };
            });
          });
        }
      });

      handleGetAllMessages();
      if (selectedChat?.lastMessage?.sender !== loggedUserData._id) {
        handleClearUnReadMessages();
      }
    }
  }, [selectedChat._id]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [allMessages]);

  return (
    <>
      <div className="app-chat-area">
        {Object.keys(selectedChat).length > 0 ? (
          <>
            <div className="app-chat-area-header">
              {formatUserName(selectedChatMember)}
            </div>

            <div ref={chatAreaRef} className="main-chat-area">
              {allMessages.map((message) => (
                <div
                  key={message.createdAt}
                  className="message-container"
                  style={
                    isSender(message)
                      ? { justifyContent: "end" }
                      : { justifyContent: "start" }
                  }
                >
                  <div>
                    <div
                      className={
                        isSender(message) ? "send-message" : "received-message"
                      }
                    >
                      {message.text}
                    </div>
                    <div
                      className="message-timestamp"
                      style={
                        isSender(message)
                          ? { float: "right" }
                          : { float: "left" }
                      }
                    >
                      {formatTime(message?.createdAt || "")}
                      {isSender(message) && message.read && (
                        <i
                          className="fa fa-check-circle"
                          aria-hidden="true"
                          style={{ color: "#e74c3c" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="send-message-div">
              <input
                type="text"
                className="send-message-input"
                placeholder="Type a message"
                value={message}
                onChange={(e) => handleMessageChange(e)}
              />
              <button
                className="fa fa-paper-plane send-message-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendMessage();
                }}
              ></button>
            </div>
          </>
        ) : (
          <div className="empty-chat-area">
            <h1>click on a user to start a chat</h1>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatArea;
