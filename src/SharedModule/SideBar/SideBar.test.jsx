import { describe, it, expect } from "vitest";
import { groupChats } from "./groupChats";

function isoHoursAgo(hours) {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

describe("groupChats", () => {
  it("buckets chats into النهاردة / إمبارح / الأقدم based on updated_at", () => {
    const chats = [
      { notebook_id: "today",     updated_at: isoHoursAgo(1) },
      { notebook_id: "yesterday", updated_at: isoHoursAgo(30) },
      { notebook_id: "old",       updated_at: isoHoursAgo(24 * 10) },
    ];

    const grouped = groupChats(chats);
    const asMap = Object.fromEntries(grouped);

    expect(asMap["النهاردة"].map((c) => c.notebook_id)).toEqual(["today"]);
    expect(asMap["إمبارح"].map((c) => c.notebook_id)).toEqual(["yesterday"]);
    expect(asMap["الأقدم"].map((c) => c.notebook_id)).toEqual(["old"]);
  });

  it("omits empty groups entirely", () => {
    const grouped = groupChats([{ notebook_id: "a", updated_at: isoHoursAgo(1) }]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0][0]).toBe("النهاردة");
  });

  it("returns an empty list for an empty input", () => {
    expect(groupChats([])).toEqual([]);
  });
});
