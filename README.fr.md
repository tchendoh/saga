# Saga

*[English version](README.md)*

Un compagnon de lecture sans spoiler pour les grandes sagas littéraires. Vous indiquez où vous en êtes dans la série, et le site n'affiche que ce que les livres ont révélé jusque-là. Première série : **Red Rising** de Pierce Brown.

Site : [saga.chummey.com](https://saga.chummey.com)

## Fonctionnement

Chaque information sur un personnage (nom, surnom, couleur, maison, fait, mort) indique à partir de quel tome le lecteur la connait :

```yaml
names:
  - value: Sevro
    since: rr        # Red Rising
  - value: Sevro au Barca
    since: gs        # Golden Son : le nom de famille révèlerait son père
```

- Un personnage pas encore apparu n'existe nulle part dans l'app, pas même dans la recherche.
- Ce qui arrive dans un tome (une mort, une trahison, une vraie identité) n'apparait qu'à partir du tome **suivant**.
- Un nouveau visiteur commence toujours au début du tome 1.

Deux réglages sont distincts : la **langue de l'interface** (menus et descriptions) et l'**édition lue** (noms des personnages, titres des tomes et vocabulaire de l'univers). Un francophone qui lit l'édition anglaise voit les noms anglais avec des descriptions en français.

## Parcours des données

```
data/**/*.yaml  →  npm run data  →  src/generated/data.json  →  site
                   (schéma Zod + règles anti-spoiler)
```

Les données sont rédigées à la main en YAML, une fiche par personnage. Le script de build les valide avec un schéma Zod et des règles anti-spoiler propres au projet, puis écrit du JSON. Le navigateur n'analyse jamais de YAML, et des données invalides ne peuvent pas être déployées. Le JSON est indépendant du site, pour pouvoir servir plus tard à une app native.

## Développement

Nécessite **Node 26** (le script de build exécute le TypeScript directement dans Node).

```bash
npm install
npm run dev        # valide les données, puis lance Vite
```

| Commande | Rôle |
| --- | --- |
| `npm run data` | Valide `data/` et écrit `src/generated/data.json` |
| `npx vitest run` | Lance les tests, dont la validation des vraies données |
| `npm run lint` | Analyse le code avec oxlint (avec les types) |
| `npm run build` | Génère les données, vérifie les types et construit `dist/` |

Un push sur `main` déploie le site par GitHub Actions.

## Documentation

- [docs/vision.md](docs/vision.md) : objectifs et principes
- [docs/data.md](docs/data.md) : format des données et règles anti-spoiler, pour rédiger les fiches
- [docs/backlog.md](docs/backlog.md) : la suite

## Avertissement

Saga est un projet de fan non officiel, sans lien avec Pierce Brown ni ses éditeurs. Toutes les descriptions sont rédigées dans nos propres mots.
