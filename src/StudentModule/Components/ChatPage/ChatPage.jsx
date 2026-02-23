import { useState, useEffect, useContext, useRef } from "react";
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
import formatMessage from "./chatFormatter";
import "./chatPage.css";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { setUserChatsId } = useContext(UserChatsId);
  const { userEmail } = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(id || null);
  const [isTyping, setIsTyping] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
        formattedMessage: msg.role !== "user" ? formatMessage(msg.text) : null,
        sender: msg.role === "user" ? "You" : "AI",
        direction: msg.role === "user" ? "outgoing" : "incoming",
        sentTime: "just now",
        isImage: false,
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

  // إغلاق الكاميرا لما الكومبوننت يتشال
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // ربط الـ stream بالـ video بعد ما showCamera يبقى true
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play();
    }
  }, [showCamera, cameraStream]);

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

      if (!currentChatId && returnedId) {
        setCurrentChatId(returnedId);
        setUserChatsId((prev) =>
          prev.includes(returnedId) ? prev : [...prev, returnedId],
        );
        navigate(`/home/chat/${returnedId}`);
      }

      if (aiReply) {
        setMessages((prev) => [
          ...prev,
          {
            message: aiReply,
            formattedMessage: formatMessage(aiReply),
            sender: "AI",
            direction: "incoming",
            sentTime: "just now",
            isImage: false,
          },
        ]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsTyping(false);
    }
  }

  function handleSubmit(text) {
    setMessages((prev) => [
      ...prev,
      {
        message: text,
        formattedMessage: null,
        sender: "You",
        direction: "outgoing",
        sentTime: "just now",
        isImage: false,
      },
    ]);
    sendMessage(text);
  }

  /* ==========================
        UPLOAD IMAGE TO API ONLY
        (بدون ما تضيف رسالة في الشات)
  ========================== */
  async function uploadImageToAPI(file) {
    try {
      setIsTyping(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("user_email", userEmail);
      if (currentChatId) formData.append("question_id", currentChatId);

      const response = await axios.post(
        "https://aiservice.magacademy.co/ask-by-question-id-v2",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.data?.response) {
        setMessages((prev) => [
          ...prev,
          {
            message: response.data.response,
            formattedMessage: formatMessage(response.data.response),
            sender: "AI",
            direction: "incoming",
            sentTime: "just now",
            isImage: false,
          },
        ]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsTyping(false);
    }
  }

  /* ==========================
        SHOW IMAGE IN CHAT
        (بتضيف الصورة في الشات بس من غير ما تبعت للـ API)
  ========================== */
  function showImageInChat(previewSrc) {
    setMessages((prev) => [
      ...prev,
      {
        message: "",
        formattedMessage: previewSrc, // base64 string
        sender: "You",
        direction: "outgoing",
        sentTime: "just now",
        isImage: true, // ← flag مهم جداً
      },
    ]);
  }

  /* ==========================
        FILE / IMAGE UPLOAD FROM DEVICE
  ========================== */
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      showImageInChat(reader.result);
      uploadImageToAPI(file);
    };
    reader.readAsDataURL(file);

    // reset عشان تقدر ترفع نفس الفايل تاني
    e.target.value = "";
  };

  /* ==========================
        CAMERA
  ========================== */
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      alert("مش قادر يوصل للكاميرا، تأكد إنك أديت الإذن.");
      console.log(err);
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (video.readyState !== 4) {
      alert("الكاميرا لسه مش جاهزة، استنى ثانية وحاول تاني");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    // نحفظ الـ base64 قبل ما نعمل أي حاجة
    const previewSrc = canvas.toDataURL("image/jpeg", 0.9);

    // نعرض الصورة في الشات فوراً
    showImageInChat(previewSrc);

    // نقفل الكاميرا
    closeCamera();

    // نبعت الصورة للـ API
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "camera-photo.jpg", {
          type: "image/jpeg",
        });
        uploadImageToAPI(file);
      },
      "image/jpeg",
      0.9,
    );
  };

  /* ==========================
        RENDER
  ========================== */
return (
  <>
    {/* ======== Camera Modal ======== */}
    {showCamera && (
      <div className="camera-overlay">
        <div className="camera-modal">
          <video
            ref={videoRef}
            className="camera-preview"
            autoPlay
            playsInline
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className="camera-controls">
            <button className="btn-capture" onClick={capturePhoto}>
              📸 التقط صورة
            </button>
            <button className="btn-close-camera" onClick={closeCamera}>
              ✕ إغلاق
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ======== Chat Layout ======== */}
    <div className="chat-layout w-100 h-100">
      <div className="chat-center w-100 h-100">
        <MainContainer className="chat-main w-100 h-100">
          <ChatContainer className="p-0 w-100">
            <MessageList
              className="chat-messages"
              typingIndicator={
                isTyping ? <TypingIndicator content="AI is typing..." /> : null
              }
            >
              {messages.map((message, index) => {
                const isAI = message.sender.toLowerCase() !== "you";
                const isUserImage = !isAI && message.isImage;

                return (
                  <Message
                    key={index}
                    model={{
                      message: isAI || isUserImage ? " " : message.message,
                      sentTime: message.sentTime,
                      sender: isAI ? "ai" : "user",
                      direction: message.direction,
                      type: "html",
                    }}
                  >
                    {/* رسائل الـ AI */}
                    {isAI && message.formattedMessage && (
                      <Message.CustomContent>
                        <div
                          className="custom-message-content w-100"
                          dangerouslySetInnerHTML={{
                            __html: message.formattedMessage,
                          }}
                        />
                      </Message.CustomContent>
                    )}

                    {/* صور اليوزر */}
                    {isUserImage && (
                      <Message.CustomContent>
                        <img
                          src={message.formattedMessage}
                          alt="uploaded"
                          style={{
                            maxWidth: "220px",
                            borderRadius: "10px",
                            display: "block",
                          }}
                        />
                      </Message.CustomContent>
                    )}
                  </Message>
                );
              })}
            </MessageList>

            {/* ======== شريط الإدخال مع الزرارين ======== */}
            <div as="MessageInput" className="input-bar">
              <button
                className="chat-icon-btn"
                onClick={openCamera}
                title="التقط صورة"
              >
                📷
              </button>
              <button
                className="chat-icon-btn"
                onClick={() => fileInputRef.current?.click()}
                title="ارفع صورة أو ملف"
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={handleFileInputChange}
              />
              <div className="input-bar__message">
                <MessageInput
                  className="chat-input"
                  onSend={handleSubmit}
                  placeholder="Type message here..."
                  attachButton={false}
                />
              </div>
            </div>
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  </>
);
}
