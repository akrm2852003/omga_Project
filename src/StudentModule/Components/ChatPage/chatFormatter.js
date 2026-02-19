import "./chatFormatter.css";

const formatMessage = (text = "") => {
  let formatted = text.trim();

  // ================= Markdown headers =================
  formatted = formatted.replace(
    /^# (.+)$/gm,
    '<h1 class="chat-heading h1">$1</h1>',
  );
  formatted = formatted.replace(
    /^## (.+)$/gm,
    '<h2 class="chat-heading h2">$1</h2>',
  );
  formatted = formatted.replace(
    /^### (.+)$/gm,
    '<h3 class="chat-heading h3">$1</h3>',
  );

  // ================= Bold / Italic =================
  formatted = formatted.replace(
    /\*\*(.+?)\*\*/g,
    '<span class="chat-subtitle">$1</span>',
  );
  formatted = formatted.replace(
    /\*(.+?)\*/g,
    '<em class="chat-italic">$1</em>',
  );

  // ================= Highlight بين الأقواس =================
  formatted = formatted.replace(
    /\(([^()]+)\)/g,
    '<span class="chat-inline-highlight">($1)</span>',
  );

  // ================= قوائم بالنجمة =================
  formatted = formatted.replace(/(^|\n)\*\s/g, "$1• ");

  // ================= الكود / المعادلات =================
  formatted = formatted.replace(
    /```([\s\S]+?)```/g,
    '<pre class="chat-code">$1</pre>',
  );

  // ================= نصائح / اقتباسات =================
  formatted = formatted.replace(
    /💡\s*(.+)/g,
    '<blockquote class="chat-tip">$1</blockquote>',
  );

  // ================= الأسهم =================
  formatted = formatted.replace(/(→|←)/g, '<span class="chat-arrow">$1</span>');

  // ================= إزالة أسطر فارغة متعددة =================
  formatted = formatted.replace(/\n{2,}/g, "\n");

  // ================= فقرات المراجع 📚 =================
  formatted = formatted.replace(
    /(^|\n)(\s*)(📚\s*المراجع \(الكتب\):.*?)(?=\n|$)/g,
    (match, p1, p2, p3) => {
      return `${p1}<p class="chat-paragraph chat-reference">${p3.trim()}</p>`;
    },
  );

  // ================= فقرات صور / أجزاء كتب 📖 =================
  formatted = formatted.replace(
    /(^|\n)(\s*)(📖.*?)(?=\n|$)/g,
    (match, p1, p2, p3) => {
      return `${p1}<p class="chat-paragraph chat-book">${p3.trim()}</p>`;
    },
  );

  // ================= الفقرات العامة =================
  formatted = formatted.replace(
    /(^|\n)(?!<div|<h[1-3]|<ul|<li|<pre|<code|<blockquote)([^<\n].+?)(?=\n|$)/g,
    (match, p1, p2) => {
      let className = "chat-paragraph";

      // هزار 🎭
      if (/^🎭/.test(p2)) {
        className += " chat-funny";
        p2 = p2.replace(/^🎭\s*/, "");
      }

      // علمي 🔹
      else if (/^🔹/.test(p2)) {
        className += " chat-scientific";
        p2 = p2.replace(/^🔹\s*/, "");
      }

      // نصيحة 💡
      else if (/^💡/.test(p2)) {
        className += " chat-tip-paragraph";
        p2 = p2.replace(/^💡\s*/, "");
      }

      return `${p1}<p class="${className}">${p2}</p>`;
    },
  );

  // ================= تنظيف فقرات حول العناوين =================
  formatted = formatted.replace(
    /<p class="chat-paragraph">\s*(<h[1-3])/g,
    "$1",
  );
  formatted = formatted.replace(/(<\/h[1-3]>)\s*<\/p>/g, "$1");

  return formatted;
};

export default formatMessage;
