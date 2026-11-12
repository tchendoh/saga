# Saga

*[Version française](README.fr.md)*

A spoiler-free reading companion for long book series. Tell it where you are in the series, and it only shows what the books have revealed so far. The first series is **Red Rising** by Pierce Brown.

Live site: [saga.chummey.com](https://saga.chummey.com)

## How it works

Every piece of information about a character (name, nickname, color, house, fact, death) is tagged with the book from which the reader knows it:

```yaml
names:
  - value: Sevro
    since: rr        # Red Rising
  - value: Sevro au Barca
    since: gs        # Golden Son: the surname would reveal his father
```

- A character who hasn't appeared yet doesn't exist anywhere in the app, not even in search.
- Anything that happens in a book (a death, a betrayal, a true identity) is only shown from the **next** book onwards.
- New visitors always start at the beginning of book 1.

Two settings are kept separate: the **interface language** (menus and descriptions) and the **edition you read** (character names, book titles and in-universe vocabulary). A French speaker reading the English edition sees English names with French descriptions.

## Data pipeline

```
data/**/*.yaml  →  npm run data  →  src/generated/data.json  →  site
                   (Zod schema + spoiler rules)
```

The data is written by hand in YAML, one file per character. The build script validates it with a Zod schema and project-specific spoiler rules, then writes plain JSON. The browser never parses YAML, and invalid data can't be deployed. The JSON is independent of the site so a native app can reuse it later.

## Development

Requires **Node 26** (the build script runs TypeScript directly in Node).

```bash
npm install
npm run dev        # validates the data, then starts Vite
```

| Command | What it does |
| --- | --- |
| `npm run data` | Validates `data/` and writes `src/generated/data.json` |
| `npx vitest run` | Runs the tests, including validation of the real data |
| `npm run lint` | Lints with oxlint (type-aware) |
| `npm run build` | Generates the data, type-checks and builds to `dist/` |

Pushing to `main` deploys the site through GitHub Actions.

## Documentation

The docs are in French:

- [docs/vision.md](docs/vision.md): goals and principles
- [docs/data.md](docs/data.md): data format and spoiler rules, for writing character files
- [docs/backlog.md](docs/backlog.md): what's next

## Disclaimer

Saga is an unofficial fan project, not affiliated with Pierce Brown or his publishers. All descriptions are written in our own words.
