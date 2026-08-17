import formatMessage, { buildImageFrame } from "./chatFormatter";

// بتحوّل رسالة مخزّنة (من /v2/chat/:id) لشكل العرض في الفرونت اند.
// دالة منفصلة عن ChatPage عشان تتختبر لوحدها من غير ما نحتاج نموك الشبكة
// وكل الـ Context بتاعة الصفحة.
export function mapStoredMessage(msg) {
  // msg.image نص (نظام v2)، msg.images مصفوفة (نظام Subject Stream) — بنقرا
  // أي واحد فيهم موجود.
  const imageUrl = msg.image || msg.images?.[0] || null;

  let formattedMessage = null;
  if (msg.role !== "user") {
    formattedMessage = formatMessage(msg.text);

    // 🐛 فيكس حقيقي لقيناه في بيانات فعلية: شاتات قديمة (قبل تحسين منطق
    // تحويل الـ SVG في الباك اند) كان بيتسجّل فيها رابط الصورة في
    // msg.images، بس النص نفسه فاضل فيه SVG خام مش متحوّل لصورة — فالصورة
    // كانت موجودة في الداتا بس مش ظاهرة خالص. لو النص متضمنش أي <img>
    // فعلي بعد التنسيق، نضيف الصور المحفوظة يدوياً.
    if (!/<img\b/i.test(formattedMessage) && Array.isArray(msg.images) && msg.images.length > 0) {
      formattedMessage += msg.images.map((src) => buildImageFrame(src)).join("");
    }
  }

  return {
    message:          msg.text,
    // 🐛 فيكس: صورة الطالب المرفوعة كانت بتتفقد لما تفتح شات قديم تاني —
    // formattedMessage كان بيتحط null لأي رسالة user، لكن الـ render
    // بيستخدم نفس الحقل ده كـ src للصورة.
    formattedMessage: msg.role !== "user" ? formattedMessage : imageUrl,
    sender:           msg.role === "user" ? "You" : "AI",
    direction:        msg.role === "user" ? "outgoing" : "incoming",
    sentTime:         "just now",
    isImage:          msg.role === "user" && !!imageUrl,
    imageUrl,
  };
}
