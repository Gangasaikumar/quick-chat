import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux-store/store";
import { setAllChats, type UserState } from "../redux-store/userSlice";
import { hideLoader, showLoader } from "../redux-store/loaderSlice";
import {
  createNewMessage,
  getAllMessages,
  type messagePayload,
} from "../apiCalls/Messages";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useState, useEffect } from "react";
import moment from "moment";
import { formatUserName } from "../utils/Helpers";
import { clearUnReadMessageCount } from "../apiCalls/Chats";
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

  const handleSendMessage = async () => {
    try {
      const newMessage: messagePayload = {
        chatId: selectedChat._id,
        sender: loggedUserData._id,
        text: message,
      };
      dispatch(showLoader());
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
    } finally {
      dispatch(hideLoader());
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

  const handleClearUnReadMessages = async (chatId: string) => {
    try {
      dispatch(showLoader());
      const response = await clearUnReadMessageCount(chatId);
      if (response.success) {
        toast.success(response.message);
        // const updatedChat = allChats.map((chat) =>
        //   chat._id === chatId ? response.data : chat,
        // );
        // dispatch(setAllChats([...allChats, updatedChat]));
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

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  useEffect(() => {
    if (selectedChat._id) {
      handleGetAllMessages();
      if (selectedChat?.lastMessage?.sender !== loggedUserData._id) {
        handleClearUnReadMessages(selectedChat._id);
      }
    }
  }, [selectedChat._id]);

  const isSender = (message: messagePayload) =>
    message.sender === loggedUserData._id;

  const formatTime = (time: string | Date) => {
    const now = moment();
    const diff = now.diff(moment(time), "days");
    if (diff < 1) {
      return `Today ${moment(time).format("hh:mm A")}`;
    } else if (diff === 1) {
      return `Yesterday ${moment(time).format("hh:mm A")}`;
    } else {
      return moment(time).format("MMM D, YYYY, hh:mm A");
    }
  };

  return (
    <>
      <div className="app-chat-area">
        {Object.keys(selectedChat).length > 0 ? (
          <>
            <div className="app-chat-area-header">
              {formatUserName(selectedChatMember)}
            </div>

            <div className="main-chat-area">
              {allMessages.map((message) => (
                <div
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
