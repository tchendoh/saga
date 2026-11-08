import { describe, expect, it } from "vitest";
import type { Series } from "../schema";
import { bookLabel, bookNumber, inEdition } from "../text";

const series: Series = {
  id: "test",
  title: "Test",
  author: "Someone",
  books: [
    { id: "one", title: "One" },
    { id: "two", title: { en: "Two", fr: "Deux" } },
  ],
  colors: [],
  houses: [],
  allegiances: [],
};

describe("inEdition", () => {
  it("returns a plain string as is", () => {
    expect(inEdition("Darrow", "fr")).toBe("Darrow");
  });
  it("picks the reader's edition", () => {
    expect(inEdition({ en: "The Reaper", fr: "le Faucheur" }, "fr")).toBe("le Faucheur");
  });
});

describe("bookNumber and bookLabel", () => {
  it("numbers books from 1 in reading order", () => {
    expect(bookNumber(series, "one")).toBe(1);
    expect(bookNumber(series, "two")).toBe(2);
  });
  it("prefixes the title with its number in the chosen edition", () => {
    expect(bookLabel(series, "two", "en")).toBe("2. Two");
    expect(bookLabel(series, "two", "fr")).toBe("2. Deux");
  });
});
