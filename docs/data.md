# Données : format et règles d'écriture

Référence pour rédiger ou modifier les fichiers de `data/`. La vision d'ensemble est dans `vision.md` ; ce document décrit le format réel, validé par `src/model/schema.ts` (Zod) et `src/model/validate.ts`.

## Organisation

```
data/
  red-rising/
    series.yaml          # tomes, couleurs, maisons, allégeances, termes
    characters/
      darrow.yaml        # une fiche par personnage
```

- Le nom du fichier n'a pas d'importance, mais on le fait correspondre à l'`id`.
- L'`id` est en minuscules, chiffres et tirets (`pax-telemanus`). Deux personnages qui portent le même nom ont deux `id` distincts (`pax` pour le fils de Darrow, `pax-telemanus` pour l'élève de l'Institut).
- Les données sont validées au chargement : une erreur affiche la liste de tous les problèmes trouvés.

## Les tomes et le marqueur `since`

Les tomes sont déclarés dans `series.yaml`, dans l'ordre de lecture, avec un identifiant court (`rr`, `gs`, `ms`, `ig`, `da`, `lb`).

Presque chaque information d'une fiche est **datée** : elle porte un `since` qui indique à partir de quel tome le lecteur la connait.

```yaml
names:
  - value: Sevro
    since: rr
  - value: Sevro au Barca
    since: gs
```

- Une information marquée `gs` est visible dès qu'on commence Golden Son.
- Quand plusieurs valeurs sont visibles, l'app affiche **la plus récente** (dernier nom, dernière couleur, dernière maison). Les noms précédents restent affichés comme anciens noms.
- `introduced` est le tome où le personnage apparait. Avant, il n'existe nulle part dans l'app, pas même dans la recherche.

## Règles anti-spoiler

- **Ce qui arrive dans un tome n'est marqué qu'à partir du tome suivant** : mort, trahison, vraie identité, lien de parenté révélé. La mort de Julian (tome 1) porte `since: gs`.
- **Un nom ou une maison qui trahit une révélation** est daté comme la révélation. Exemple : Sevro s'appelle « Sevro » en `rr` ; « au Barca » révèlerait son père.
- **Un personnage connu d'abord sous un surnom** a ce surnom comme premier nom (`Mustang`, `le Chacal`), et son vrai nom à partir du tome qui le révèle.

Vérifications automatiques (`validate.ts`) :

- rien n'est révélé avant `introduced` ;
- au moins un nom et une couleur sont visibles dès `introduced` ;
- couleurs, maisons, allégeances et termes existent dans `series.yaml` ;
- une relation n'est pas révélée avant que son personnage cible soit introduit ;
- une mort est révélée après le tome d'introduction.

Ces règles ne détectent pas un spoiler écrit dans le texte d'une description : la relecture reste nécessaire.

## Deux réglages de langue

L'app distingue :

- **la langue de l'interface** (`fr`, `en`) : menus et **descriptions** ;
- **l'édition lue** (`en`, `fr`) : **noms, surnoms, titres et vocabulaire de l'univers**.

Un francophone qui lit l'édition anglaise voit donc des descriptions en français avec les termes anglais.

### Textes de l'édition (noms, termes)

Une chaîne simple si elle est identique dans toutes les éditions, sinon une valeur par édition :

```yaml
names:
  - value: Darrow au Andromedus          # identique partout
    since: gs
  - value: { en: The Jackal, fr: le Chacal }
    since: rr
```

### Descriptions (faits et mort)

Toujours en `fr` **et** en `en`, rédigées naturellement dans chaque langue (pas de traduction mot à mot) :

```yaml
facts:
  - since: rr
    value:
      fr: Le poète de la Maison Mars.
      en: The poet of House Mars.
```

## Marqueurs de termes : `{term:id}`

Un terme de l'univers qui change selon l'édition ne s'écrit pas en dur dans une description. On le déclare une fois dans `series.yaml` :

```yaml
terms:
  - { id: howlers, name: { en: Howlers, fr: Hurleurs } }
  - { id: institute, name: { en: the Institute, fr: l'Institut } }
```

puis on l'insère avec un marqueur dans les deux langues de la description :

```yaml
facts:
  - since: gs
    value:
      fr: Chef des {term:howlers}.
      en: Leader of the {term:howlers}.
```

- Le marqueur est remplacé par le terme de **l'édition lue**, quelle que soit la langue de l'interface.
- Fonctionne dans les faits (`facts`) et la mort (`death`).
- Un marqueur qui pointe vers un terme absent de `series.yaml` est une erreur de validation.
- Les articles et accords restent dans la phrase : le terme est un groupe nominal. Si un article change selon l'édition, on peut l'inclure dans le terme (`l'Institut`), mais il faut alors l'écrire partout de la même façon.
- Code : `termIds` et `resolveTerms` dans `src/model/text.ts`.

Les termes français non vérifiés dans les livres sont signalés par un `TODO` dans `series.yaml`.

## Brouillons

Un fait marqué `draft: true # à réécrire` est un texte importé, à reformuler dans nos mots avant de faire connaitre le site.

- Un brouillon peut n'exister qu'en une langue.
- Les brouillons sont des instantanés par tome : seul le plus récent visible est affiché, alors que les faits réécrits s'additionnent.

## Narrateurs

Le rôle `narrator` est daté comme le reste :

```yaml
roles:
  - value: narrator
    since: ig
```

Les narrateurs remontent en haut de la liste, juste après le protagoniste.

## Écrire une bonne description

Le lecteur cherche un nom qu'il a oublié : la description doit lui permettre de **reconnaitre** le personnage, pas seulement de le résumer.

- **Un repère concret** plutôt qu'un trait vague : une scène de première rencontre, un détail physique, une habitude, un surnom, son lien avec Darrow ou son groupe.
- **La première scène n'est pas un spoiler** : le lecteur qui cherche ce nom l'a déjà rencontré. Ce qui suit cette scène en est un.
- **Éviter les débuts interchangeables** (« Élève de l'Institut, … ») : dire ce qui le distingue des autres élèves.
- **Une ou deux phrases**, lisibles d'un coup d'œil sur un téléphone.
- **Dans nos propres mots** : ne pas reprendre les Dramatis Personae ni les textes publiés. Les wikis et pages de fans servent à vérifier les faits, pas à copier.

Exemple :

| À éviter | Mieux |
|---|---|
| Élève de l'Institut, brutal et autoritaire. | Le colosse de la Maison Mars qui impose sa loi par la peur dès les premiers jours. |
