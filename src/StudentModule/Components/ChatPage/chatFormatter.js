import "./chatFormatter.css";

const formatMessage = (text = "") => {
  let formatted = text.trim();

  // ================= Escape HTML first =================
  // (optional safety – skip if backend already sanitizes)

  // ================= Code blocks FIRST (protect content) =================
  const codeBlocks = [];
  formatted = formatted.replace(/```([\s\S]+?)```/g, (match, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre class="chat-code">${code}</pre>`);
    return `%%CODE_BLOCK_${idx}%%`;
  });

  // ================= Markdown headers =================
  formatted = formatted.replace(
    /^#{3}\s+(.+)$/gm,
    '<h3 class="chat-heading h3">$1</h3>',
  );
  formatted = formatted.replace(
    /^#{2}\s+(.+)$/gm,
    '<h2 class="chat-heading h2">$1</h2>',
  );
  formatted = formatted.replace(
    /^#\s+(.+)$/gm,
    '<h1 class="chat-heading h1">$1</h1>',
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

  // ================= Inline highlight between parentheses =================
  // Only highlight if content is short (avoid wrapping whole sentences)
  formatted = formatted.replace(
    /\(([^()\n]{1,60})\)/g,
    '<span class="chat-inline-highlight">($1)</span>',
  );

  // ================= Bullet lists (* item or - item) =================
  formatted = formatted.replace(/(^|\n)[*-]\s+(.+)/g, (match, pre, item) => {
    return `${pre}<li class="chat-list-item">${item}</li>`;
  });
  // Wrap consecutive <li> elements in <ul>
  formatted = formatted.replace(
    /(<li class="chat-list-item">[\s\S]+?<\/li>)(\n<li class="chat-list-item">[\s\S]+?<\/li>)*/g,
    (match) => `<ul class="chat-list">${match}</ul>`,
  );

  // ================= Tips / quotes =================
  formatted = formatted.replace(
    /💡\s*(.+)/g,
    '<blockquote class="chat-tip">💡 $1</blockquote>',
  );

  // ================= Arrows =================
  formatted = formatted.replace(
    /(→|←|➡|⬅)/g,
    '<span class="chat-arrow">$1</span>',
  );

  // ================= References 📚 =================
  formatted = formatted.replace(
    /(^|\n)(📚[^\n]+)/g,
    (match, pre, content) =>
      `${pre}<p class="chat-paragraph chat-reference">${content.trim()}</p>`,
  );

  // ================= Book / image paragraphs 📖 =================
  formatted = formatted.replace(
    /(^|\n)(📖[^\n]+)/g,
    (match, pre, content) =>
      `${pre}<p class="chat-paragraph chat-book">${content.trim()}</p>`,
  );

  // ================= Remove excessive blank lines =================
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // ================= General paragraphs =================
  // Split by newlines and wrap plain text lines that aren't already HTML
  const lines = formatted.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    // Skip lines already wrapped in HTML tags
    if (/^<(h[1-3]|p|ul|li|pre|blockquote|div)/.test(trimmed)) return line;
    // Skip placeholder tokens
    if (/^%%CODE_BLOCK_\d+%%$/.test(trimmed)) return line;

    let className = "chat-paragraph";

    if (/^🎭/.test(trimmed)) {
      className += " chat-funny";
      return `<p class="${className}">${trimmed.replace(/^🎭\s*/, "")}</p>`;
    } else if (/^🔹/.test(trimmed)) {
      className += " chat-scientific";
      return `<p class="${className}">${trimmed.replace(/^🔹\s*/, "")}</p>`;
    } else if (/^💡/.test(trimmed)) {
      // already handled above, skip
      return line;
    } else if (/^📚/.test(trimmed) || /^📖/.test(trimmed)) {
      // already handled above, skip
      return line;
    }

    return `<p class="${className}">${trimmed}</p>`;
  });

  formatted = processedLines.join("\n");

  // ================= Restore code blocks =================
  codeBlocks.forEach((block, idx) => {
    formatted = formatted.replace(`%%CODE_BLOCK_${idx}%%`, block);
  });

  // ================= Cleanup: p tags wrapping block elements =================
  formatted = formatted.replace(
    /<p class="chat-paragraph">\s*(<h[1-3])/g,
    "$1",
  );
  formatted = formatted.replace(/(<\/h[1-3]>)\s*<\/p>/g, "$1");

  return formatted;
};

export default formatMessage;
