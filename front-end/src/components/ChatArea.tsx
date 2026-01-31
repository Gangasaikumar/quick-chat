import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux-store/store";
import type { UserState } from "../redux-store/userSlice";
import { hideLoader, showLoader } from "../redux-store/loaderSlice";
import {
  createNewMessage,
  getAllMessages,
  type messagePayload,
} from "../apiCalls/Messages";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useState, useEffect } from "react";
const ChatArea = () => {
  const { selectedChat, loggedUserData } = useSelector(
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

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  useEffect(() => {
    if (selectedChat._id) {
      handleGetAllMessages();
    }
  }, [selectedChat._id]);

  return (
    <>
      <div className="app-chat-area">
        {Object.keys(selectedChat).length > 0 ? (
          <>
            <div className="app-chat-area-header">
              {selectedChatMember?.firstName +
                " " +
                selectedChatMember?.lastName}
            </div>

            <div className="main-chat-area">CHAT AREA</div>
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
