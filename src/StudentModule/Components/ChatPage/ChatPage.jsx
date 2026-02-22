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
import { useParams, useNavigate } from "react-router-dom";
import { UserChatsId } from "../../../Context/ChatsContext/ChatsContext";
import { UserContext } from "../../../Context/AuthContext/AuthContext";
import formatMessage from "./chatFormatter"; // ← import the formatter
import "./chatPage.css"; // ← CSS الجديد

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
        `https://aiservice.magacademy.co/v2/chat/${chatId}`
      );
      const formattedMessages = response.data.chat.map((msg) => ({
        message: msg.text,
        formattedMessage: msg.role !== "user" ? formatMessage(msg.text) : null,
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
    if (id) getChat(id);
    else {
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
        }
      );

      const returnedId = response.data?.question_id;
      const aiReply = response.data?.response;

      if (!currentChatId && returnedId) {
        setCurrentChatId(returnedId);
        setUserChatsId((prev) => (prev.includes(returnedId) ? prev : [...prev, returnedId]));
        navigate(`/home/chat/${returnedId}`);
      }

      if (aiReply) {
        const aiMessage = {
          message: aiReply,
          formattedMessage: formatMessage(aiReply),
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
      formattedMessage: null,
      sender: "You",
      direction: "outgoing",
      sentTime: "just now",
    };
    setMessages((prev) => [...prev, userMessage]);
    sendMessage(text);
  }

  return (
    <div className="chat-layout w-100 h-100">
      <div className="chat-center w-100 h-100">
        <MainContainer className="chat-main w-100 h-100">
          <ChatContainer className=" p-0 w-100">
            <MessageList
              className="chat-messages"
              typingIndicator={isTyping ? <TypingIndicator content="AI is typing..." /> : null}
            >
              {messages.map((message, index) => {
                const isAI = message.sender.toLowerCase() !== "you";
                return (
                  <Message
                    key={index}
                    model={{
                      message: isAI ? " " : message.message,
                      sentTime: message.sentTime,
                      sender: isAI ? "ai" : "user",
                      direction: message.direction,
                      type: "html",
                    }}
                  >
                    {isAI && message.formattedMessage && (
                      <Message.CustomContent>
                        <div
                          className="custom-message-content"
                          dangerouslySetInnerHTML={{ __html: message.formattedMessage }}
                        />
                      </Message.CustomContent>
                    )}
                  </Message>
                );
              })}
            </MessageList>

            <MessageInput
              className="chat-input"
              onSend={handleSubmit}
              placeholder="Type message here..."
              attachButton={false}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}