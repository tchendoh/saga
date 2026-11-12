// Valide les YAML de /data et écrit le résultat en JSON, prêt pour le site (et plus tard l'app native).
// Lancé par Node directement, sans compilation : npm run data
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { validateAll } from "../src/model/validateAll.ts";

const root = join(import.meta.dirname, "..");
const outputFile = join(root, "src/generated/data.json");

// Mêmes clés que import.meta.glob : "/data/red-rising/series.yaml"
const files: Record<string, string> = {};
for (const entry of readdirSync(join(root, "data"), { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".yaml")) continue;
  const fullPath = join(entry.parentPath, entry.name);
  files[`/${relative(root, fullPath)}`] = readFileSync(fullPath, "utf8");
}

try {
  const all = validateAll(files);
  mkdirSync(join(root, "src/generated"), { recursive: true });
  writeFileSync(outputFile, `${JSON.stringify(all)}\n`);
  const count = all.reduce((sum, s) => sum + s.characters.length, 0);
  console.log(`data: ${all.length} series, ${count} characters -> ${relative(root, outputFile)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
