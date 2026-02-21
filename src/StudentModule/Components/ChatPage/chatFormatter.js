import "./chatFormatter.css";

const formatMessage = (text = "") => {
    let formatted = text.trim();

    /* ================= حماية أي HTML Blocks ووضعها داخل frame ================= */
    const htmlPlaceholders = [];
    const HTML_TOKEN = (i) => `⟦HTML_${i}⟧`;

    formatted = formatted.replace(
        /<div[\s\S]*?<\/div>|<img[\s\S]*?>|<svg[\s\S]*?<\/svg>/gi,
        (match) => {
            const key = HTML_TOKEN(htmlPlaceholders.length);
            // نضع أي HTML في frame خاص
            const framed = `<div class="chat-html-frame">${match}</div>`;
            htmlPlaceholders.push(framed);
            return key;
        }
    );

    /* ================= حماية المعادلات بين $...$ ================= */
    const mathPlaceholders = [];
    const MATH_TOKEN = (i) => `⟦MATH_${i}⟧`;

    formatted = formatted.replace(/\$(.+?)\$/g, (_, expr) => {
        const key = MATH_TOKEN(mathPlaceholders.length);

        const cleaned = expr
            .replace(/\\xrightarrow\{\\text\{([^}]+)\}\}/g, "→ $1")
            .replace(/\\xrightarrow\{([^}]+)\}/g, "→ $1")
            .replace(/\\rightarrow/g, "→")
            .replace(/\\left|\\right/g, "");

        mathPlaceholders.push(
            `<span class="chat-inline-math">${cleaned}</span>`
        );

        return key;
    });

    /* ================= Headers ================= */
    formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="chat-heading h3">$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="chat-heading h2">$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="chat-heading h1">$1</h1>');

    /* ================= Bold / Italic ================= */
    formatted = formatted.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<span class="chat-subtitle">$1</span>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em class="chat-italic">$1</em>');

    /* ================= Lists ================= */
    formatted = formatted.replace(/(^|\n)\*\s+/g, "$1• ");

    /* ================= Code ================= */
    formatted = formatted.replace(/```([\s\S]+?)```/g, '<pre class="chat-code">$1</pre>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

    /* ================= Superscript ================= */
    formatted = formatted.replace(
        /([A-Za-z0-9\]\)])\^(\d+)/g,
        '$1<sup>$2</sup>'
    );

    /* ================= Tips ================= */
    formatted = formatted.replace(
        /💡\s*(.+)/g,
        '<blockquote class="chat-tip-paragraph">$1</blockquote>'
    );

    /* ================= Paragraph Wrapper ================= */
    formatted = formatted.replace(
        /(^|\n)(?!<h|<pre|<blockquote|<div|⟦MATH_)([^<\n].+?)(?=\n|$)/g,
        (m, p1, line) => {
            let cls = "chat-paragraph card-step";
            let txt = line;

            if (txt.startsWith("🔹")) {
                cls += " chat-scientific";
                txt = txt.replace(/^🔹\s*/, "");
            } else if (txt.startsWith("🎭")) {
                cls = "chat-paragraph chat-funny";
                txt = txt.replace(/^🎭\s*/, "");
            } else if (txt.startsWith("💡")) {
                cls += " chat-tip-paragraph";
                txt = txt.replace(/^💡\s*/, "");
            } else if (txt.startsWith("⚛️")) {
                cls += " chat-math-card";
                txt = txt.replace(/^⚛️\s*/, "");
            } else if (/→|Δ|heat|catalyst/i.test(txt)) {
                cls = "chat-math-card";
            }

            return `${p1}<p class="${cls}">${txt}</p>`;
        }
    );

    /* ================= Highlight الشروط ================= */
    formatted = formatted.replace(
        /\((Δ|Heat|°C|Ni|Pt|MnO₂|catalyst|حرارة)\)/gi,
        '<span class="chat-inline-highlight-important">($1)</span>'
    );

    formatted = formatted.replace(
        /\(([^()]+)\)/g,
        '<span class="chat-inline-highlight">($1)</span>'
    );

    /* ================= Highlight Numbers ================= */
    formatted = formatted.replace(
        /\b\d+(\.\d+)?\b/g,
        '<span class="chat-inline-number">$&</span>'
    );

    /* ================= رجوع المعادلات ================= */
    mathPlaceholders.forEach((math, i) => {
        formatted = formatted.replace(MATH_TOKEN(i), math);
    });

    /* ================= رجوع HTML ================= */
    htmlPlaceholders.forEach((html, i) => {
        formatted = formatted.replace(HTML_TOKEN(i), html);
    });

    return formatted;
};

export default formatMessage;