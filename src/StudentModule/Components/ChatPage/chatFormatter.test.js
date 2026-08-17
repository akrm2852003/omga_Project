import { describe, it, expect } from "vitest";
import formatMessage, { buildImageFrame } from "./chatFormatter";

describe("formatMessage", () => {
  it("converts headers", () => {
    expect(formatMessage("### عنوان صغير")).toContain('<h3 class="chat-heading h3">عنوان صغير</h3>');
    expect(formatMessage("## عنوان متوسط")).toContain('<h2 class="chat-heading h2">عنوان متوسط</h2>');
    expect(formatMessage("# عنوان كبير")).toContain('<h1 class="chat-heading h1">عنوان كبير</h1>');
  });

  it("converts bold to chat-subtitle and italic to chat-italic", () => {
    expect(formatMessage("**مهم**")).toContain('<span class="chat-subtitle">مهم</span>');
    expect(formatMessage("*ملاحظة*")).toContain('<em class="chat-italic">ملاحظة</em>');
  });

  it("highlights a standalone bold answer line", () => {
    const out = formatMessage("**الإجابة: ٤٢**");
    expect(out).toContain('<p class="chat-answer-highlight">الإجابة: ');
  });

  it("turns 🔹/🎭/💡 leading paragraphs into their card classes and strips the emoji", () => {
    expect(formatMessage("🔹 نقطة علمية")).toContain('<p class="chat-paragraph chat-scientific">نقطة علمية</p>');
    expect(formatMessage("🎭 رد خفيف")).toContain('<p class="chat-paragraph chat-funny">رد خفيف</p>');
  });

  it("wraps a 💡 tip line in a blockquote instead of a plain paragraph", () => {
    const out = formatMessage("💡 الخلاصة: كده تمام");
    expect(out).toContain('<blockquote class="chat-tip-paragraph">الخلاصة: كده تمام</blockquote>');
    expect(out).not.toContain("<p ");
  });

  it("protects fenced code blocks from being mangled by the bold/italic pass", () => {
    // لو الكود مش محمي، الـ ** أو * جوا الكود هيتحولوا لـ <span>/<em> غلط
    const out = formatMessage("```\nlet a = 2*3; // x**y\n```");
    expect(out).toContain('<pre class="chat-code">');
    expect(out).toContain("let a = 2*3; // x**y");
    expect(out).not.toContain("chat-subtitle");
    expect(out).not.toContain("chat-italic");
  });

  it("protects inline code the same way", () => {
    const out = formatMessage("استخدم `a*b` هنا");
    expect(out).toContain('<code class="chat-inline-code">a*b</code>');
    expect(out).not.toContain("chat-italic");
  });

  it("wraps a <div> block in chat-html-frame and leaves it untouched by paragraph wrapping", () => {
    const out = formatMessage('<div style="margin:10px">محتوى</div>');
    expect(out).toContain('<div class="chat-html-frame"><div style="margin:10px">محتوى</div></div>');
  });

  it("strips explicit width/height from an <svg> and adds a viewBox derived from them", () => {
    const out = formatMessage('<svg width="800" height="600"><rect/></svg>');
    expect(out).not.toMatch(/<svg[^>]*\swidth="800"/);
    expect(out).toContain('viewBox="0 0 800 600"');
    expect(out).toContain("width:100%;height:auto;display:block;");
  });

  it("converts a caret exponent to <sup>", () => {
    // الرقم جوه الـ <sup> بيتلف كمان بـ chat-inline-number لأن هايلايت
    // الأرقام بيشتغل بعد تحويل الـ superscript — سلوك متوقع، مش باگ.
    expect(formatMessage("x^2")).toContain("x<sup>");
    expect(formatMessage("x^2")).toContain("</sup>");
  });

  it("wraps ==text== as an answer highlight span", () => {
    expect(formatMessage("==خلاصة==")).toContain('<span class="chat-answer-highlight">خلاصة</span>');
  });

  it("wraps standalone numbers with chat-inline-number", () => {
    expect(formatMessage("العدد 42 هنا")).toContain('<span class="chat-inline-number">42</span>');
  });

  it("cleans LaTeX-ish math delimiters and escapes", () => {
    const out = formatMessage("$a \\times b$");
    expect(out).toContain('<span class="chat-inline-math">a × b</span>');
  });

  it("returns an empty string for empty input without throwing", () => {
    expect(formatMessage("")).toBe("");
  });

  it("wraps a diagram <img> with zoom and download action links", () => {
    const url = "https://aiservice.magacademy.co/uploads/drawings/x.webp";
    const out = formatMessage(`<div style="margin:10px"><img src="${url}" alt="drawing"/></div>`);

    expect(out).toContain("chat-image-actions-wrap");
    // زرار التكبير: لينك يفتح الصورة الأصلية في تاب جديد
    expect(out).toContain(`href="${url}" target="_blank"`);
    // زرار التحميل: لينك download حقيقي بدون أي JS
    expect(out).toContain(`href="${url}" download`);
  });

  it("buildImageFrame produces a framed, action-wrapped image from a bare URL", () => {
    const url = "https://aiservice.magacademy.co/uploads/drawings/legacy.webp";
    const out = buildImageFrame(url);

    expect(out).toContain("chat-html-frame");
    expect(out).toContain(`src="${url}"`);
    expect(out).toContain("chat-image-actions-wrap");
    expect(out).toContain(`href="${url}" download`);
  });
});
