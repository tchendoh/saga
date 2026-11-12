import { validateAll, type LoadedSeries } from "./validateAll";

export type { LoadedSeries };

const files = import.meta.glob("/data/*/**/*.yaml", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

/** Parses and validates every series under /data. Throws with every problem found. */
export function loadAll(): LoadedSeries[] {
  return validateAll(files);
}
