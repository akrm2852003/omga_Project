import { describe, it, expect } from "vitest";
import { relativeTime } from "./relativeTime";

describe("relativeTime", () => {
  it("returns دلوقتي for a timestamp just now", () => {
    expect(relativeTime(new Date().toISOString())).toBe("دلوقتي");
  });

  it("formats minutes ago", () => {
    const iso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(relativeTime(iso)).toBe("من 5 دقيقة");
  });

  it("formats hours ago", () => {
    const iso = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(relativeTime(iso)).toBe("من 3 ساعة");
  });

  it("formats days ago", () => {
    const iso = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();
    expect(relativeTime(iso)).toBe("من 2 يوم");
  });

  it("falls back to a locale date for anything older than a month", () => {
    const iso = new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString();
    expect(relativeTime(iso)).toBe(new Date(iso).toLocaleDateString("ar-EG"));
  });
});
