import { describe, expect, it } from "vitest";
import { loadAll } from "../load";

describe("data files", () => {
  it("are all valid and spoiler-safe", () => {
    const all = loadAll();
    expect(all.map((s) => s.series.id)).toContain("red-rising");
  });
});
