import { describe, expect, it } from "vitest";
import { effectivePosition, isVisible } from "../position";
import type { Series } from "../schema";

const series: Series = {
  id: "test",
  title: "Test",
  author: "Someone",
  books: [
    { id: "one", title: "One" },
    { id: "two", title: "Two" },
    { id: "three", title: "Three" },
  ],
  colors: [],
};

describe("effectivePosition", () => {
  it("stays at the current book with no spoilers", () => {
    expect(effectivePosition(series, "two", "none")).toBe(1);
  });
  it("moves to the next book when the current one is finished", () => {
    expect(effectivePosition(series, "two", "finished")).toBe(2);
  });
  it("goes past the last book when spoiling everything", () => {
    expect(effectivePosition(series, "one", "all")).toBe(3);
  });
});

describe("isVisible", () => {
  it("shows what is known from the current book or before", () => {
    expect(isVisible(series, "one", 1)).toBe(true);
    expect(isVisible(series, "two", 1)).toBe(true);
  });
  it("hides what comes later", () => {
    expect(isVisible(series, "three", 1)).toBe(false);
  });
  it("throws on an unknown book", () => {
    expect(() => isVisible(series, "four", 1)).toThrow(/Unknown book/);
  });
});
