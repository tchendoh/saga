import { parse } from "yaml";
import { Character, Series } from "./schema";
import { checkCharacter } from "./validate";

export type LoadedSeries = { series: Series; characters: Character[] };

const files = import.meta.glob("/data/*/**/*.yaml", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

/** Parses and validates every series under /data. Throws with every problem found. */
export function loadAll(): LoadedSeries[] {
  const problems: string[] = [];
  const result: LoadedSeries[] = [];

  const seriesFiles = Object.keys(files).filter((path) => path.endsWith("/series.yaml"));
  for (const seriesPath of seriesFiles) {
    const folder = seriesPath.slice(0, -"series.yaml".length);
    const parsedSeries = Series.safeParse(parse(files[seriesPath]));
    if (!parsedSeries.success) {
      problems.push(`${seriesPath}: ${parsedSeries.error.message}`);
      continue;
    }
    const series = parsedSeries.data;
    const characters: Character[] = [];
    for (const path of Object.keys(files).filter((p) => p.startsWith(`${folder}characters/`))) {
      const parsed = Character.safeParse(parse(files[path]));
      if (!parsed.success) {
        problems.push(`${path}: ${parsed.error.message}`);
        continue;
      }
      problems.push(...checkCharacter(series, parsed.data).map((p) => `${path}: ${p}`));
      characters.push(parsed.data);
    }
    result.push({ series, characters });
  }

  if (problems.length > 0) throw new Error(`Invalid data:\n- ${problems.join("\n- ")}`);
  return result;
}
