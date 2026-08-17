import { describe, it, expect } from "vitest";
import { groupChats } from "./groupChats";

// مبنية على أيام التقويم مش فرق ساعات، عشان التِست ميبقاش flaky حوالين نص الليل
// (لو استخدمنا "من ساعة" ممكن يقع في اليوم اللي فات لو الوقت الحالي قريب من نص الليل).
function isoDaysAgoAtNoon(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

describe("groupChats", () => {
  it("buckets chats into النهاردة / إمبارح / الأقدم based on updated_at", () => {
    const chats = [
      { notebook_id: "today",     updated_at: new Date().toISOString() },
      { notebook_id: "yesterday", updated_at: isoDaysAgoAtNoon(1) },
      { notebook_id: "old",       updated_at: isoDaysAgoAtNoon(10) },
    ];

    const grouped = groupChats(chats);
    const asMap = Object.fromEntries(grouped);

    expect(asMap["النهاردة"].map((c) => c.notebook_id)).toEqual(["today"]);
    expect(asMap["إمبارح"].map((c) => c.notebook_id)).toEqual(["yesterday"]);
    expect(asMap["الأقدم"].map((c) => c.notebook_id)).toEqual(["old"]);
  });

  it("omits empty groups entirely", () => {
    const grouped = groupChats([{ notebook_id: "a", updated_at: new Date().toISOString() }]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0][0]).toBe("النهاردة");
  });

  it("returns an empty list for an empty input", () => {
    expect(groupChats([])).toEqual([]);
  });
});
