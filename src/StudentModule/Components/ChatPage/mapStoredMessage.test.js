import { describe, it, expect } from "vitest";
import { mapStoredMessage } from "./mapStoredMessage";

describe("mapStoredMessage", () => {
  it("keeps a normal assistant text message as-is", () => {
    const out = mapStoredMessage({ role: "assistant", text: "أهلاً بيك" });
    expect(out.sender).toBe("AI");
    expect(out.direction).toBe("incoming");
    expect(out.formattedMessage).toContain("أهلاً بيك");
  });

  it("renders an assistant diagram whose text already has the spliced <img>", () => {
    const url = "https://aiservice.magacademy.co/uploads/drawings/new.webp";
    const out = mapStoredMessage({
      role: "assistant",
      text: `شرح...\n<div style="margin:10px"><img src="${url}"/></div>`,
      images: [url],
    });

    // مرة واحدة بس — متضاعفش الصورة لأنها موجودة أصلاً في النص
    const occurrences = out.formattedMessage.split(`src="${url}"`).length - 1;
    expect(occurrences).toBe(1);
  });

  // 🐛 الباگ الحقيقي اللي اتلاقى في بيانات فعلية: شاتات قديمة السيرفر كان
  // بيسجّل فيها رابط الصورة في images[] بس مايسيبش <img> في النص (لسه فيه
  // <svg> خام). لازم الصورة تفضل تبان برضو.
  it("recovers an image from images[] when the text never got an <img> spliced in", () => {
    const url = "https://aiservice.magacademy.co/uploads/drawings/legacy.webp";
    const out = mapStoredMessage({
      role: "assistant",
      text: `شرح فيه <svg viewBox="0 0 10 10"><circle r="5"/></svg> خام مش متحول`,
      images: [url],
    });

    expect(out.formattedMessage).toContain(`src="${url}"`);
    expect(out.formattedMessage).toContain("chat-image-actions-wrap");
  });

  it("leaves plain assistant text (no images at all) untouched by the recovery logic", () => {
    const out = mapStoredMessage({ role: "assistant", text: "مفيش رسم هنا", images: [] });
    expect(out.formattedMessage).not.toContain("<img");
  });

  it("recovers a student-uploaded image from the v2 store (msg.image, singular)", () => {
    const url = "https://aiservice.magacademy.co/uploads/questions_v2/x/pic.png";
    const out = mapStoredMessage({ role: "user", text: "حل", image: url, images: [] });

    expect(out.isImage).toBe(true);
    expect(out.imageUrl).toBe(url);
    expect(out.formattedMessage).toBe(url);
    expect(out.direction).toBe("outgoing");
  });

  it("recovers a student-uploaded image from the Subject Stream store (msg.images, plural)", () => {
    const url = "https://aiservice.magacademy.co/uploads/questions/x/pic.png";
    const out = mapStoredMessage({ role: "user", text: "حل", image: null, images: [url] });

    expect(out.isImage).toBe(true);
    expect(out.imageUrl).toBe(url);
    expect(out.formattedMessage).toBe(url);
  });

  it("does not mark a plain text user message as an image", () => {
    const out = mapStoredMessage({ role: "user", text: "سؤال عادي", image: null, images: [] });
    expect(out.isImage).toBe(false);
    expect(out.imageUrl).toBeNull();
  });
});
