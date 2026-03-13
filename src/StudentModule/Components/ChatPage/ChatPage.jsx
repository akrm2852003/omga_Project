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
  const [pendingImage, setPendingImage] = useState(null);
  const [inputText, setInputText] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ Fix: لما اليوزر يعمل copy، ياخد plain text بس من غير فورمات أو ألوان
  useEffect(() => {
    const handleCopy = (e) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const plainText = selection.toString();
      e.clipboardData.setData("text/plain", plainText);
      e.clipboardData.setData("text/html", plainText);
      e.preventDefault();
    };
    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  // ✅ Paste image: لما اليوزر يعمل Ctrl+V بصورة، تتحط كـ pendingImage
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onloadend = () => {
            setPendingImage({ previewSrc: reader.result, file });
          };
          reader.readAsDataURL(file);

          e.preventDefault(); // منع أي سلوك تاني للـ paste
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

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

  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    };
  }, [cameraStream]);

  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play();
    }
  }, [showCamera, cameraStream]);

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

      console.log(response);
      
    } catch (error) {
      console.log(error);
    } finally {
      setIsTyping(false);
    }
  }

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

  function showImageInChat(previewSrc) {
    setMessages((prev) => [
      ...prev,
      {
        message: "",
        formattedMessage: previewSrc,
        sender: "You",
        direction: "outgoing",
        sentTime: "just now",
        isImage: true,
      },
    ]);
  }

  function handleSubmit(text) {
    if (pendingImage) {
      showImageInChat(pendingImage.previewSrc);
      if (text && text.trim()) {
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
      }
      uploadImageToAPI(pendingImage.file);
      setPendingImage(null);
      setInputText("");
      return;
    }
    if (!text || !text.trim()) return;
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
    setInputText("");
  }

  function handleImageOnlySend() {
    if (!pendingImage) return;
    showImageInChat(pendingImage.previewSrc);
    if (inputText && inputText.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          message: inputText,
          formattedMessage: null,
          sender: "You",
          direction: "outgoing",
          sentTime: "just now",
          isImage: false,
        },
      ]);
    }
    uploadImageToAPI(pendingImage.file);
    setPendingImage(null);
    setInputText("");
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingImage({ previewSrc: reader.result, file });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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
    const previewSrc = canvas.toDataURL("image/jpeg", 0.9);
    closeCamera();
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "camera-photo.jpg", {
          type: "image/jpeg",
        });
        setPendingImage({ previewSrc, file });
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <>
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

      <div className="chat-layout w-100 h-100">
        <div className="chat-center w-100 h-100">
          <MainContainer className="chat-main w-100 h-100">
            <ChatContainer className="p-0 w-100">
              <MessageList
                className="chat-messages"
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator content="AI is typing..." />
                  ) : null
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

              <div as="MessageInput" className="input-bar">
                {pendingImage && (
                  <div className="pending-image-preview">
                    <img src={pendingImage.previewSrc} alt="preview" />
                    <button
                      className="pending-image-remove"
                      onClick={() => setPendingImage(null)}
                      title="إزالة الصورة"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="input-bar__controls">
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
                      onChange={(val) => setInputText(val)}
                      value={inputText}
                      placeholder={
                        pendingImage
                          ? "اكتب رسالة مع الصورة أو اضغط إرسال..."
                          : "Type message here..."
                      }
                      attachButton={false}
                      sendButton={!pendingImage}
                    />
                  </div>

                  {pendingImage && (
                    <button
                      className="chat-icon-btn chat-send-btn"
                      onClick={handleImageOnlySend}
                      title="إرسال"
                    >
                      ➤
                    </button>
                  )}
                </div>
              </div>
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </>
  );
}
