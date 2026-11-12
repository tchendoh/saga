import { parse } from "yaml";
import { Character, Series } from "./schema";
import { checkCharacter } from "./validate";

export type LoadedSeries = { series: Series; characters: Character[] };

/**
 * Analyse et valide toutes les séries à partir d'un dictionnaire { chemin: texte YAML }.
 * Indépendant de Vite : utilisable dans le navigateur, dans Node (script de build) et dans les tests.
 * Lance une erreur qui liste tous les problèmes trouvés.
 */
export function validateAll(files: Record<string, string>): LoadedSeries[] {
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
    const paths = new Map<string, string>();
    for (const path of Object.keys(files).filter((p) => p.startsWith(`${folder}characters/`))) {
      const parsed = Character.safeParse(parse(files[path]));
      if (!parsed.success) {
        problems.push(`${path}: ${parsed.error.message}`);
        continue;
      }
      if (paths.has(parsed.data.id)) problems.push(`${path}: duplicate id "${parsed.data.id}" (also in ${paths.get(parsed.data.id)})`);
      paths.set(parsed.data.id, path);
      characters.push(parsed.data);
    }
    // Vérifié une fois tout le monde chargé, puisque les relations pointent vers d'autres personnages.
    for (const character of characters) {
      problems.push(...checkCharacter(series, character, characters).map((p) => `${paths.get(character.id)}: ${p}`));
    }
    result.push({ series, characters });
  }

  if (problems.length > 0) throw new Error(`Invalid data:\n- ${problems.join("\n- ")}`);
  return result;
}
