import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "../../../redux-store/store";
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
import EmojiPicker from "emoji-picker-react";

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
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const handleSendMessage = async (image?: string) => {
    try {
      const newMessage: messagePayload = {
        chatId: selectedChat._id,
        sender: loggedUserData._id,
        text: message,
        image,
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
        setShowEmojiPicker(false);
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
        const updatedChat = allChats.map((chat) =>
          chat._id === selectedChat._id ? response.data : chat,
        );
        dispatch(setAllChats(updatedChat));
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

  const formatTime = (time?: string | Date): string => {
    if (!time) return "";

    const messageTime = moment(time); // auto-detects string or Date
    const now = moment();

    if (messageTime.isSame(now, "day")) {
      return `Today ${messageTime.format("hh:mm A")}`;
    }

    if (messageTime.isSame(now.clone().subtract(1, "day"), "day")) {
      return `Yesterday ${messageTime.format("hh:mm A")}`;
    }

    return messageTime.format("MMM D, YYYY, hh:mm A");
  };

  const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      const reader = new FileReader();
      if (file) {
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          if (typeof reader.result === "string") {
            handleSendMessage(reader.result);
          }
        };
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    }
  };

  useEffect(() => {
    if (selectedChat._id) {
      socket.off("receive-message").on("receive-message", (message) => {
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

      socket.on("user-typing", (message) => {
        setTypingUser(message?.sender);
        if (
          selectedChat._id === message.chatId &&
          message.sender !== loggedUserData._id
        ) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
          }, 2000);
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
  }, [allMessages, isTyping]);

  return (
    <>
      <div className="app-chat-area">
        {Object.keys(selectedChat).length > 0 ? (
          <>
            <div className="app-chat-area-header">
              {formatUserName(selectedChatMember)}
            </div>

            <div ref={chatAreaRef} className="main-chat-area">
              {allMessages.map((message, index) => (
                <div
                  key={index}
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
                      <div>{message.text}</div>
                      {message.image && (
                        <img
                          height={120}
                          width={120}
                          src={message.image}
                          alt=""
                        />
                      )}
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
                          style={{ color: "#e74c3c" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="typing-indicator">
                {isTyping &&
                  selectedChat.members
                    ?.map((member) => member._id)
                    ?.includes(typingUser as string) && <i>typing.....</i>}
              </div>
            </div>
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiClick={(e) => {
                  setMessage((prev) => prev + e.emoji);
                }}
                style={{
                  width: "300px",
                  height: "400px",
                  position: "absolute",
                  bottom: "110px",
                  right: "110px",
                  zIndex: 1000,
                  filter: "drop-shadow(0 0 10px #ddd)",
                }}
              />
            )}
            <div className="send-message-div">
              <label htmlFor="file">
                <i className="fa fa-picture-o send-image-btn" />
                <input
                  type="file"
                  id="file"
                  style={{ display: "none" }}
                  accept="image/jpg,image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleSendImage}
                />
              </label>
              <button
                className="fa fa-smile-o send-emoji-btn"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                }}
              ></button>
              <input
                type="text"
                className="send-message-input"
                placeholder="Type a message"
                value={message}
                onChange={(e) => {
                  handleMessageChange(e);
                  socket.emit("typing", {
                    chatId: selectedChat._id,
                    members: selectedChat.members?.map((member) => member._id),
                    sender: loggedUserData._id,
                  });
                }}
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
