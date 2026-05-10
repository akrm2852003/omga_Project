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

const API_BASE = "https://aiservice.magacademy.co";

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

  const videoRef         = useRef(null);
  const canvasRef        = useRef(null);
  const fileInputRef     = useRef(null);
  const abortRef         = useRef(null);
  const currentChatIdRef = useRef(id || null); // ✅ ref يتتبع الـ currentChatId دايماً
  const isStreamingRef   = useRef(false); // ✨ التعديل: ref لمنع الـ useEffect من مسح الشات أثناء الـ Stream

  // ── sync ref مع الـ state ────────────────────────────────────────
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // ── copy plain text ──────────────────────────────────────────────
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

  // ── paste image ──────────────────────────────────────────────────
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onloadend = () => setPendingImage({ previewSrc: reader.result, file });
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // ── load existing chat ───────────────────────────────────────────
  async function getChat(chatId) {
    try {
      // 🔹 الـ endpoint ده اتعدل في الباك إند عشان يقبل notebook_id
      const response = await axios.get(`${API_BASE}/v2/chat/${chatId}`);
      const formattedMessages = response.data.chat.map((msg) => ({
        message:          msg.text,
        formattedMessage: msg.role !== "user" ? formatMessage(msg.text) : null,
        sender:           msg.role === "user" ? "You" : "AI",
        direction:        msg.role === "user" ? "outgoing" : "incoming",
        sentTime:         "just now",
        isImage:          !!msg.image,
        imageUrl:         msg.image || null,
      }));
      setMessages(formattedMessages);
      setCurrentChatId(chatId);
      currentChatIdRef.current = chatId;
    } catch (error) {
      console.log(error);
    }
  }

  // ✨ التعديل: التأكد إن الـ stream مش شغال قبل ما نجيب الداتا عشان الرسالة متتمسحش
  useEffect(() => {
    if (id && !isStreamingRef.current) {
      getChat(id);
    } else if (!id) {
      setMessages([]);
      setCurrentChatId(null);
      currentChatIdRef.current = null;
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cameraStream]);

  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play();
    }
  }, [showCamera, cameraStream]);

  // ══════════════════════════════════════════════════════════════════
  // ✅ sendMessageStream
  // ══════════════════════════════════════════════════════════════════
  async function sendMessageStream(text, imageFile = null) {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    isStreamingRef.current = true; // ✨ التعديل: إعلام المكون إن في Stream شغال حالاً

    // ✅ نقرأ من الـ ref مش من الـ state عشان نضمن القيمة الحالية
    const chatIdToUse = currentChatIdRef.current;

    const formData = new FormData();
    formData.append("user_email", userEmail);
    formData.append("question",   text || "");
    
    // ✨ التعديل الأهم: نبعت الـ ID باسم notebook_id عشان الباك إند يضيف الرسالة لنفس الجلسة
    if (chatIdToUse) formData.append("notebook_id", chatIdToUse); 
    
    if (imageFile)   formData.append("image", imageFile);

    setIsTyping(true);

    setMessages((prev) => [
      ...prev,
      {
        message:          "",
        formattedMessage: "",
        sender:           "AI",
        direction:        "incoming",
        sentTime:         "just now",
        isImage:          false,
        isStreaming:      true,
      },
    ]);

    let accumulatedText = "";

    try {
      const response = await fetch(`${API_BASE}/ask-by-question-id-v2-stream`, {
        method: "POST",
        body:   formData,
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const reader     = response.body.getReader();
      const decoder    = new TextDecoder();
      let   lineBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split("\n");
        lineBuffer  = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();

          if (payload === "[DONE]") {
            setMessages((prev) =>
              prev.map((msg, idx) =>
                idx === prev.length - 1 ? { ...msg, isStreaming: false } : msg
              )
            );
            break;
          }

          let parsed;
          try { parsed = JSON.parse(payload); } catch { continue; }

          // ── error من السيرفر ──
          if (parsed.error) {
            setMessages((prev) =>
              prev.map((msg, idx) =>
                idx === prev.length - 1
                  ? {
                      ...msg,
                      message:          parsed.error,
                      formattedMessage: `<p style="color:red">${parsed.error}</p>`,
                      isStreaming:      false,
                    }
                  : msg
              )
            );
            setIsTyping(false);
            return;
          }

          // ✨ التعديل: نستقبل notebook_id عشان نحدث الـ URL لو دي محادثة جديدة باستخدام replace
          const returnedChatId = parsed.notebook_id || parsed.question_id;
          if (returnedChatId && currentChatIdRef.current !== returnedChatId) {
            const newChatId = returnedChatId;
            currentChatIdRef.current = newChatId;
            setCurrentChatId(newChatId);
            setUserChatsId((prev) =>
              prev.includes(newChatId) ? prev : [...prev, newChatId]
            );
            navigate(`/home/chat/${newChatId}`, { replace: true }); // ✨ ضفنا replace عشان ميبوظش الـ Back
          }

          // ── chunk جديد ──
          if (parsed.chunk) {
            accumulatedText += parsed.chunk;
            setMessages((prev) =>
              prev.map((msg, idx) =>
                idx === prev.length - 1
                  ? {
                      ...msg,
                      message:          accumulatedText,
                      formattedMessage: formatMessage(accumulatedText),
                    }
                  : msg
              )
            );
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") { console.log("Stream aborted"); return; }
      console.error("Stream error:", err);
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? {
                ...msg,
                message:          "❌ حدث خطأ في الاتصال، حاول تاني.",
                formattedMessage: `<p style="color:red">❌ حدث خطأ في الاتصال، حاول تاني.</p>`,
                isStreaming:      false,
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
      isStreamingRef.current = false; // ✨ التعديل: خلصنا Stream نرجعها false
    }
  }

  // ── upload image (stream) ────────────────────────────────────────
  async function uploadImageStream(file, text = "") {
    await sendMessageStream(text, file);
  }

  // ── show user image in chat ──────────────────────────────────────
  function showImageInChat(previewSrc) {
    setMessages((prev) => [
      ...prev,
      {
        message:          "",
        formattedMessage: previewSrc,
        sender:           "You",
        direction:        "outgoing",
        sentTime:         "just now",
        isImage:          true,
      },
    ]);
  }

  // ── handleSubmit ─────────────────────────────────────────────────
  function handleSubmit(text) {
    if (pendingImage) {
      showImageInChat(pendingImage.previewSrc);
      if (text && text.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            message:          text,
            formattedMessage: null,
            sender:           "You",
            direction:        "outgoing",
            sentTime:         "just now",
            isImage:          false,
          },
        ]);
      }
      uploadImageStream(pendingImage.file, text || "");
      setPendingImage(null);
      setInputText("");
      return;
    }

    if (!text || !text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        message:          text,
        formattedMessage: null,
        sender:           "You",
        direction:        "outgoing",
        sentTime:         "just now",
        isImage:          false,
      },
    ]);

    sendMessageStream(text);
    setInputText("");
  }

  // ── handleImageOnlySend ──────────────────────────────────────────
  function handleImageOnlySend() {
    if (!pendingImage) return;
    showImageInChat(pendingImage.previewSrc);
    if (inputText && inputText.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          message:          inputText,
          formattedMessage: null,
          sender:           "You",
          direction:        "outgoing",
          sentTime:         "just now",
          isImage:          false,
        },
      ]);
    }
    uploadImageStream(pendingImage.file, inputText || "");
    setPendingImage(null);
    setInputText("");
  }

  // ── file input ───────────────────────────────────────────────────
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPendingImage({ previewSrc: reader.result, file });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── camera ───────────────────────────────────────────────────────
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      alert("مش قادر يوصل للكاميرا، تأكد إنك أديت الإذن.");
      console.log(err);
    }
  };

  const closeCamera = () => {
    if (cameraStream) { cameraStream.getTracks().forEach((t) => t.stop()); setCameraStream(null); }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState !== 4) { alert("الكاميرا لسه مش جاهزة، استنى ثانية وحاول تاني"); return; }
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const previewSrc = canvas.toDataURL("image/jpeg", 0.9);
    closeCamera();
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        setPendingImage({ previewSrc, file });
      },
      "image/jpeg",
      0.9
    );
  };

  // ════════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════════
  return (
    <>
      {showCamera && (
        <div className="camera-overlay">
          <div className="camera-modal">
            <video ref={videoRef} className="camera-preview" autoPlay playsInline />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div className="camera-controls">
              <button className="btn-capture"      onClick={capturePhoto}>📸 التقط صورة</button>
              <button className="btn-close-camera" onClick={closeCamera}>✕ إغلاق</button>
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
                  isTyping ? <TypingIndicator content="AI is typing..." /> : null
                }
              >
                {messages.map((message, index) => {
                  const isAI        = message.sender.toLowerCase() !== "you";
                  const isUserImage = !isAI && message.isImage;

                  return (
                    <Message
                      key={index}
                      model={{
                        message:   isAI || isUserImage ? " " : message.message,
                        sentTime:  message.sentTime,
                        sender:    isAI ? "ai" : "user",
                        direction: message.direction,
                        type:      "html",
                      }}
                    >
                      {/* ── رسالة AI ── */}
                      {isAI && (
                        <Message.CustomContent>
                          <div
                            className="custom-message-content w-100"
                            dangerouslySetInnerHTML={{
                              __html:
                                message.formattedMessage ||
                                (message.isStreaming
                                  ? "<span class='streaming-cursor'>▍</span>"
                                  : ""),
                            }}
                          />
                        </Message.CustomContent>
                      )}

                      {/* ── صورة المستخدم ── */}
                      {isUserImage && (
                        <Message.CustomContent>
                          <img
                            src={message.formattedMessage}
                            alt="uploaded"
                            style={{ maxWidth: "220px", borderRadius: "10px", display: "block" }}
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
                    >✕</button>
                  </div>
                )}

                <div className="input-bar__controls">
                  <button className="chat-icon-btn" onClick={openCamera} title="التقط صورة">📷</button>
                  <button className="chat-icon-btn" onClick={() => fileInputRef.current?.click()} title="ارفع صورة أو ملف">📎</button>
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
                    >➤</button>
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
