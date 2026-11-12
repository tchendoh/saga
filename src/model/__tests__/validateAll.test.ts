import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { loadAll } from "../load";
import { validateAll } from "../validateAll";

const root = join(import.meta.dirname, "../../..");

/** Lit les YAML de /data avec fs, comme le fera le script de build, au format de import.meta.glob. */
function readDataFiles(): Record<string, string> {
  const files: Record<string, string> = {};
  for (const entry of readdirSync(join(root, "data"), { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".yaml")) continue;
    const fullPath = join(entry.parentPath, entry.name);
    files[`/${relative(root, fullPath)}`] = readFileSync(fullPath, "utf8");
  }
  return files;
}

describe("validateAll", () => {
  it("returns nothing when there are no files", () => {
    expect(validateAll({})).toEqual([]);
  });

  it("names the file when a series is invalid", () => {
    expect(() => validateAll({ "/data/test/series.yaml": "id: test" })).toThrow("/data/test/series.yaml");
  });

  it("gives the same result from files read by Node as from Vite", () => {
    expect(validateAll(readDataFiles())).toEqual(loadAll());
  });

  it("fills in the Zod defaults, so the result can be written to JSON", () => {
    const [{ characters }] = validateAll(readDataFiles());
    expect(characters.every((c) => Array.isArray(c.facts) && Array.isArray(c.relations))).toBe(true);
  });
});
