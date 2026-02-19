import { useState, useEffect, useContext } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import axios from "axios";
import SideBar from "../../../SharedModule/SideBar/SideBar";
import { useParams, useNavigate } from "react-router-dom";
import { UserChatsId } from "../../../Context/ChatsContext/ChatsContext";
import { UserContext } from "../../../Context/AuthContext/AuthContext";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { setUserChatsId } = useContext(UserChatsId);
  const { userEmail } = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(id || null);
  const [isTyping, setIsTyping] = useState(false);

  /* ==========================
        GET OLD CHAT
  ========================== */
  async function getChat(chatId) {
    try {
      const response = await axios.get(
        `https://aiservice.magacademy.co/v2/chat/${chatId}`,
      );
      const formattedMessages = response.data.chat.map((msg) => ({
        message: msg.text,
        sender: msg.role === "user" ? "You" : "AI",
        direction: msg.role === "user" ? "outgoing" : "incoming",
        sentTime: "just now",
      }));
      setMessages(formattedMessages);
      setCurrentChatId(chatId);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (id) {
      getChat(id);
    } else {
      setMessages([]);
      setCurrentChatId(null);
    }
  }, [id]);

  /* ==========================
        SEND MESSAGE
  ========================== */
  async function sendMessage(text) {
    try {
      setIsTyping(true);

      const response = await axios.post(
        "https://aiservice.magacademy.co/ask-by-question-id-v2",
        {
          user_email: userEmail,
          question: text,
          ...(currentChatId && { question_id: currentChatId }),
        },
      );

      const returnedId = response.data?.question_id;
      const aiReply = response.data?.response;

      /* لو أول رسالة */
      if (!currentChatId && returnedId) {
        setCurrentChatId(returnedId);
        setUserChatsId((prev) => {
          if (prev.includes(returnedId)) return prev;
          return [...prev, returnedId];
        });

        navigate(`/home/chat/${returnedId}`);
      }

      /* إضافة رد AI */
      if (aiReply) {
        const aiMessage = {
          message: aiReply,
          sender: "AI",
          direction: "incoming",
          sentTime: "just now",
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsTyping(false);
    }
  }

  function handleSubmit(text) {
    const userMessage = {
      message: text,
      sender: "You",
      direction: "outgoing",
      sentTime: "just now",
    };
    setMessages((prev) => [...prev, userMessage]);
    sendMessage(text);
  }

  return (
    <div className="container-fluid p-0 d-flex">
      {/* Sidebar */}
      <div className="sidebar">
        <SideBar userEmail={userEmail} />
      </div>

      {/* Chat Area */}
      <div className="ai-chat-container d-flex justify-content-center align-items-center vh-100 w-100 p-2">
        <MainContainer className="shadow-lg p-3 mb-5 custom-w-h rounded-3 border-1">
          <ChatContainer>
            <MessageList
              typingIndicator={
                isTyping ? <TypingIndicator content="AI is typing..." /> : null
              }
            >
              {messages.map((message, index) => (
                <Message
                  key={index}
                  model={{
                    message: message.message,
                    sentTime: message.sentTime,
                    sender:
                      message.sender.toLowerCase() === "you" ? "user" : "ai",
                    direction: message.direction,
                  }}
                />
              ))}
            </MessageList>
            <MessageInput
              onSend={handleSubmit}
              placeholder="Type message here"
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}
