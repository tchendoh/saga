// Données déjà validées par npm run data (scripts/build-data.ts).
// Seuls des types sont importés de validateAll : ni yaml ni Zod n'arrivent dans le navigateur.
import raw from "../generated/data.json";
import type { LoadedSeries } from "./validateAll.ts";

export const allSeries = raw as unknown as LoadedSeries[];
