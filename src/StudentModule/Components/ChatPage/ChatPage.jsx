import { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCamera, FiPaperclip, FiSend, FiX } from "react-icons/fi";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { UserChatsId } from "../../../Context/ChatsContext/UserChatsId";
import { UserContext } from "../../../Context/AuthContext/UserContext";
import formatMessage from "./chatFormatter";
import "./chatFormatter.css";
import "./chatPage.css";

const API_BASE = "https://aiservice.magacademy.co";

// كل مادة بتتكلم مع الـ endpoint المخصص بتاعها في الباك اند (handleSubjectStream)
// بدل الـ endpoint العام — نفس الباراميترز والـ SSE format، مجرد مسار مختلف.
const SUBJECT_SUGGESTIONS = [
  { key: "chemistry", label: "كيمياء",          emoji: "🧪", endpoint: "/ask-by-question-id-chemistry-stream", prompt: "ممكن تشرحلي درس التآصل في الكيمياء؟" },
  { key: "physics",   label: "فيزياء",          emoji: "⚛️", endpoint: "/ask-by-question-id-physics-stream",   prompt: "عايز أفهم قانون نيوتن التاني بشكل مبسط" },
  { key: "biogeo",    label: "أحياء وجيولوجيا", emoji: "🧬", endpoint: "/ask-by-question-id-biogeo-stream",    prompt: "اشرحلي الانقسام الميتوزي خطوة بخطوة" },
  { key: "arabic",    label: "عربي",            emoji: "📖", endpoint: "/ask-by-question-id-arabic-stream",    prompt: "وضحلي الفرق بين المفعول المطلق والمفعول لأجله" },
  { key: "english",   label: "إنجليزي",         emoji: "🔤", endpoint: "/ask-by-question-id-english-stream",   prompt: "Explain the difference between present perfect and past simple" },
];

const DEFAULT_SUBJECT_KEY = SUBJECT_SUGGESTIONS[0].key;

export default function ChatPage() {
  // 🔒 رقم الشات بيتبعت عن طريق location.state مش الـ URL path — عشان
  // الـ id متبقاش ظاهرة في السيرش بار.
  const location = useLocation();
  const id = location.state?.chatId || null;
  const navigate = useNavigate();

  const { setUserChatsId } = useContext(UserChatsId);
  const { userEmail, userName } = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(id || null);
  const [isTyping, setIsTyping] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [inputText, setInputText] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT_KEY);
  const [isExistingV2Chat, setIsExistingV2Chat] = useState(!!id); // بيتحكم بس في إظهار/إخفاء اختيار المادة

  const videoRef         = useRef(null);
  const canvasRef        = useRef(null);
  const fileInputRef     = useRef(null);
  const textareaRef      = useRef(null);
  const scrollRef        = useRef(null);
  const abortRef         = useRef(null);
  const currentChatIdRef   = useRef(id || null); // ✅ ref يتتبع الـ currentChatId دايماً
  const isStreamingRef     = useRef(false); // ref لمنع الـ useEffect من مسح الشات أثناء الـ Stream
  const streamingChatIdRef = useRef(null); // هو الشات رقم كام اللي بيعمله Stream دلوقتي (مش أي شات)
  const activeChatFetchRef = useRef(null); // آخر chatId اتطلب من getChat — بيمنع رد قديم متأخر إنه يكتب فوق شات جديد

  // 🔀 مصدر الشات الحالي: "v2" لو اتحمّل من محادثة موجودة قبل كده (عن طريق
  // /v2/chat/:id)، أو "subject" لو شات جديد لسه ما اتبعتش فيه أي رسالة.
  // الشاتات القديمة (v2) لازم تفضل بتتكلم مع نفس الـ endpoint اللي اتحفظت
  // بيه أصلاً، عشان الرسايل الجديدة تتضاف لنفس المحادثة صح؛ شاتات جديدة
  // بتتكلم مع الـ endpoint بتاع المادة المختارة.
  const chatSourceRef = useRef(id ? "v2" : "subject");

  // ── sync ref مع الـ state ────────────────────────────────────────
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // ── auto-scroll لآخر رسالة ──────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ── auto-resize للـ textarea ─────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [inputText]);

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
    // 🐛 فيكس "بيجيب شات قديم": لو المستخدم دوس على شات تاني قبل ما الطلب ده
    // يخلص، الـ request بتاع الشات القديم لسه ممكن يرجع بعد الجديد (race
    // condition عادي في الشبكة). بنسجل مين آخر شات اتطلب، ولما الرد يوصل
    // بنتأكد إنه لسه هو المطلوب قبل ما نكتب فوق الرسايل.
    activeChatFetchRef.current = chatId;
    try {
      const response = await axios.get(`${API_BASE}/v2/chat/${chatId}`);

      if (activeChatFetchRef.current !== chatId) return; // فيه شات أحدث اتطلب في الوقت ده، تجاهل الرد ده

      const formattedMessages = response.data.chat.map((msg) => {
        // 🐛 فيكس: صورة الطالب المرفوعة كانت بتتفقد لما تفتح شات قديم تاني —
        // formattedMessage كان بيتحط null لأي رسالة user، لكن الـ render
        // بيستخدم نفس الحقل ده كـ src للصورة. كمان msg.images (مصفوفة، من
        // نظام Subject Stream) دلوقتي بتتقرا زي msg.image (نص، من نظام v2).
        const imageUrl = msg.image || msg.images?.[0] || null;
        return {
          message:          msg.text,
          formattedMessage: msg.role !== "user" ? formatMessage(msg.text) : imageUrl,
          sender:           msg.role === "user" ? "You" : "AI",
          direction:        msg.role === "user" ? "outgoing" : "incoming",
          sentTime:         "just now",
          isImage:          msg.role === "user" && !!imageUrl,
          imageUrl,
        };
      });
      setMessages(formattedMessages);
      setCurrentChatId(chatId);
      currentChatIdRef.current = chatId;
      chatSourceRef.current = "v2"; // اتحمّلت من نظام النوتبوكس القديم (v2)
      setIsExistingV2Chat(true);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (id) {
      // لو ده نفس الشات اللي بيتعمله Stream دلوقتي (مثلاً أول رسالة في شات
      // جديد بيتحدث الـ URL له)، متعملش fetch عشان الرد الجاي بالـ Stream
      // متتمسحش برد قديم من السيرفر.
      if (isStreamingRef.current && streamingChatIdRef.current === id) return;

      // 🐛 فيكس "بيجيب شات قديم": لو المستخدم فتح شات تاني (من الـ Sidebar
      // مثلاً) وسط ما شات مختلف لسه بيعمل Stream، كان الشرط القديم بيمنع
      // تحميل الشات الجديد خالص فيفضل يعرض رسايل الشات القديم تحت URL
      // الشات الجديد. هنا بنلغي الـ Stream القديم ونحمّل الشات المطلوب فعلاً.
      if (isStreamingRef.current) {
        if (abortRef.current) abortRef.current.abort();
        isStreamingRef.current = false;
        setIsTyping(false);
      }

      getChat(id);
    } else {
      setMessages([]);
      setCurrentChatId(null);
      currentChatIdRef.current = null;
      chatSourceRef.current = "subject"; // شات جديد هيتبعت للمادة المختارة
      setIsExistingV2Chat(false);
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

    isStreamingRef.current = true; // إعلام المكون إن في Stream شغال حالاً

    // ✅ نقرأ من الـ ref مش من الـ state عشان نضمن القيمة الحالية
    const chatIdToUse = currentChatIdRef.current;
    streamingChatIdRef.current = chatIdToUse; // مين الشات اللي الـ Stream ده بتاعه بالظبط

    // 🔀 شات قديم (v2) يفضل يتكلم مع نفس الـ endpoint العام، وشات جديد
    // يتكلم مع endpoint المادة المختارة — من غير أي تغيير في الباك اند
    // أو أسماء الباراميترز، الاتنين بياخدوا نفس الحقول بالظبط.
    const isV2 = chatSourceRef.current === "v2";
    const targetUrl = isV2
      ? `${API_BASE}/ask-by-question-id-v2-stream`
      : `${API_BASE}${SUBJECT_SUGGESTIONS.find((s) => s.key === subject)?.endpoint || SUBJECT_SUGGESTIONS[0].endpoint}`;

    const formData = new FormData();
    formData.append("user_email",   userEmail);
    formData.append("student_name", userName || "");
    formData.append("question",     text || "");

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
      const response = await fetch(targetUrl, {
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
                      formattedMessage: `<p style="color:var(--danger)">${parsed.error}</p>`,
                      isStreaming:      false,
                    }
                  : msg
              )
            );
            setIsTyping(false);
            return;
          }

          // ✨ نستقبل notebook_id عشان نحدث الـ URL لو دي محادثة جديدة باستخدام replace
          const returnedChatId = parsed.notebook_id || parsed.question_id;
          if (returnedChatId && currentChatIdRef.current !== returnedChatId) {
            const newChatId = returnedChatId;
            currentChatIdRef.current = newChatId;
            streamingChatIdRef.current = newChatId; // الشات الجديد ده هو اللي بيتعمله Stream دلوقتي
            setCurrentChatId(newChatId);
            setUserChatsId((prev) =>
              prev.includes(newChatId) ? prev : [...prev, newChatId]
            );
            // ✨ replace عشان ميبوظش الـ Back — والـ id بيتبعت في الـ state مش في المسار نفسه
            navigate("/home/chat", { replace: true, state: { chatId: newChatId } });
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
                formattedMessage: `<p style="color:var(--danger)">❌ حدث خطأ في الاتصال، حاول تاني.</p>`,
                isStreaming:      false,
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
      isStreamingRef.current = false; // خلصنا Stream نرجعها false
      if (streamingChatIdRef.current === chatIdToUse || streamingChatIdRef.current === currentChatIdRef.current) {
        streamingChatIdRef.current = null;
      }
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

  // ── handleSend (نص و/أو صورة) ─────────────────────────────────────
  function handleSend() {
    const text = inputText;

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
      <AnimatePresence>
        {showCamera && (
          <motion.div
            className="camera-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="camera-modal"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <video ref={videoRef} className="camera-preview" autoPlay playsInline />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div className="camera-controls">
                <button className="btn-capture" onClick={capturePhoto}>📸 التقط صورة</button>
                <button className="btn-close-camera" onClick={closeCamera}>✕ إغلاق</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chat-page">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <h2>إزاي أقدر أساعدك النهاردة؟</h2>
            <p>اكتب سؤالك أو صوّر واجبك، وهرد عليك فوراً</p>
            <div className="subject-chips">
              {SUBJECT_SUGGESTIONS.map((s) => (
                <button
                  key={s.key}
                  className={`subject-chip ${subject === s.key ? "active" : ""}`}
                  onClick={() => { setSubject(s.key); setInputText(s.prompt); textareaRef.current?.focus(); }}
                >
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-scroll-area" ref={scrollRef}>
            {messages.map((message, index) => {
              const isAI        = message.sender.toLowerCase() !== "you";
              const isUserImage = !isAI && message.isImage;

              return (
                <motion.div
                  key={index}
                  className={`msg-row ${isAI ? "incoming" : "outgoing"}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {isAI && <div className="msg-avatar">أ</div>}
                  <div className="msg-bubble">
                    {isAI ? (
                      <div
                        className="custom-message-content"
                        dangerouslySetInnerHTML={{
                          __html:
                            message.formattedMessage ||
                            (message.isStreaming ? "<span class='streaming-cursor'></span>" : ""),
                        }}
                      />
                    ) : isUserImage ? (
                      <img src={message.formattedMessage} alt="مرفوع" />
                    ) : (
                      message.message
                    )}
                  </div>
                </motion.div>
              );
            })}

          </div>
        )}

        <div className="composer-wrap">
          {!isExistingV2Chat && (
            <div className="subject-switcher">
              <span className="subject-switcher-label">المادة:</span>
              {SUBJECT_SUGGESTIONS.map((s) => (
                <button
                  key={s.key}
                  className={`subject-switcher-pill ${subject === s.key ? "active" : ""}`}
                  onClick={() => setSubject(s.key)}
                  title={s.label}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence>
            {pendingImage && (
              <motion.div
                className="pending-image-preview"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
              >
                <img src={pendingImage.previewSrc} alt="معاينة" />
                <button
                  className="pending-image-remove"
                  onClick={() => setPendingImage(null)}
                  title="إزالة الصورة"
                >
                  <FiX size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="composer-bar">
            <button className="composer-icon-btn" onClick={openCamera} title="التقط صورة">
              <FiCamera size={19} />
            </button>
            <button className="composer-icon-btn" onClick={() => fileInputRef.current?.click()} title="ارفع صورة أو ملف">
              <FiPaperclip size={19} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />

            <textarea
              ref={textareaRef}
              className="composer-textarea"
              rows={1}
              placeholder={pendingImage ? "اكتب رسالة مع الصورة أو ابعت..." : "اكتب سؤالك هنا..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="composer-send-btn"
              onClick={handleSend}
              disabled={!pendingImage && !inputText.trim()}
              title="إرسال"
            >
              <FiSend size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
