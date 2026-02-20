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
        // For AI messages, store the formatted HTML version
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

      /* First message in a new chat */
      if (!currentChatId && returnedId) {
        setCurrentChatId(returnedId);
        setUserChatsId((prev) => {
          if (prev.includes(returnedId)) return prev;
          return [...prev, returnedId];
        });
        navigate(`/home/chat/${returnedId}`);
      }

      /* Add AI reply with formatted HTML */
      if (aiReply) {
        const aiMessage = {
          message: aiReply,
          formattedMessage: formatMessage(aiReply), // ← apply formatter
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
      formattedMessage: null, // user messages are plain text
      sender: "You",
      direction: "outgoing",
      sentTime: "just now",
    };
    setMessages((prev) => [...prev, userMessage]);
    sendMessage(text);
  }

  return (
    <div className="container-fluid p-0 d-flex" style={{ height: "100dvh" }}>
      {/* Chat Area */}
      <div className="ai-chat-container d-flex justify-content-center align-items-center w-100 p-2">
        <MainContainer className="shadow-lg rounded-3 h-100 w-100">
          <ChatContainer className=" d-flex flex-column">
            <MessageList
              className="flex-grow-1  overflow-auto"
              typingIndicator={
                isTyping ? <TypingIndicator content="AI is typing..." /> : null
              }
            >
              {messages.map((message, index) => {
                const isAI = message.sender.toLowerCase() !== "you";

                return (
                  <Message
                    
                    key={index}
                    model={{
                      // For AI messages we render HTML; pass a placeholder so
                      // chatscope renders the bubble, then we override content.
                      message: isAI
                        ? " " // placeholder – real content injected below
                        : message.message,
                      sentTime: message.sentTime,
                      sender: isAI ? "ai" : "user",
                      direction: message.direction,
                      type: "html", // tells chatscope to accept html payload
                    }}
                  >
                    {/* Custom HTML content for AI messages */}
                    {isAI && message.formattedMessage ? (
                      <Message.CustomContent className="ms-bg ">
                        <div
                          className="custom-message-content  "
                          dangerouslySetInnerHTML={{
                            __html: message.formattedMessage,
                          }}
                        />
                      </Message.CustomContent>
                    ) : null}
                  </Message>
                );
              })}
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
‍