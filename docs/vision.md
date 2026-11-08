# Saga : vision du projet

Compagnon de lecture sans spoiler pour les grandes sagas littéraires. Le lecteur indique où il en est (pour l'instant, le tome), et le site n'affiche que ce qui a été révélé jusque-là. Première série : **Red Rising** de Pierce Brown.

## Principes

- **Aucun spoiler, jamais.** Un personnage pas encore introduit n'apparait nulle part, y compris dans la recherche.
- **Un nouveau visiteur commence au début du tome 1**, jamais à la fin de la série.
- **Mobile d'abord.** L'usage principal : on lit, on tombe sur un nom oublié, on sort son téléphone.
- **Site public.** Toutes les descriptions sont rédigées dans nos propres mots, sans reprendre les Dramatis Personae ni les textes des éditions publiées.

## Modèle de données : des faits datés

Une seule fiche par personnage. Chaque information (nom, surnom, couleur, fait, mort) porte un marqueur `since` indiquant à partir de quelle position elle est connue du lecteur.

```yaml
id: darrow
color: { value: red, since: rr }
facts:
  - since: rr
    text:
      fr: Mineur helldiver à Lykos.
      en: Helldiver miner in Lykos.
```

- Position : pour l'instant, **le tome seulement** (`rr`, `gs`, `ms`…). Un fait marqué `gs` est visible dès qu'on commence Golden Son.
- **Règle d'écriture** : la description d'un tome présente le personnage tel qu'on le découvre, sans rien annoncer de ce qui lui arrive dans ce tome. Une révélation (mort, trahison, vraie identité) n'est marquée qu'à partir du **tome suivant**. Exemple : la mort d'Eo n'apparait qu'à partir de `gs`.
- Le format doit permettre d'aller plus finement plus tard sans réécrire les données existantes : on ajouterait un suffixe (`gs:12`), et `gs` seul resterait synonyme de « début du tome ».
- Données saisies en YAML, validées au build avec Zod.
- Règles de validation propres au projet, par exemple : aucun fait révélé avant l'introduction du personnage, chaque texte présent dans toutes les langues.
- Les fichiers de données sont indépendants du site, pour pouvoir servir plus tard à une app native (Swift, `Codable`).

## Langues : interface et édition

Deux réglages distincts :

- **Langue de l'interface** : menus, boutons et descriptions des personnages.
- **Édition lue** : noms, surnoms, titres des tomes, vocabulaire de l'univers et numérotation des chapitres.

Exemple : un francophone qui lit en anglais voit « **Sevro au Barca**, surnommé *Goblin*. Membre de la maison Mars, il devient l'un des Howlers. »

- Descriptions stockées par **langue** ; noms, termes et titres stockés par **édition**.
- Les descriptions font référence aux termes avec un marqueur (`{term:howlers}`), remplacé selon l'édition choisie.
- La recherche fouille toutes les éditions à la fois.
- Par défaut, l'édition suit la langue de l'interface.

## Réglages personnels

Enregistrés dans le navigateur (`localStorage`), séparément pour chaque série. Aucun compte, aucune donnée personnelle stockée sur un serveur.

- Langue de l'interface et édition lue.
- Position de lecture.
- Thème (clair, sombre ou selon le système).
- **Niveau de spoiler** :
  - **Rien** (par défaut) : seulement ce qui est connu au début du tome choisi.
  - **J'ai fini ce tome** : ajoute ce que le tome actuel révèle. Variante envisagée : révélations floutées, qu'on touche pour les dévoiler une à une.
  - **Tout** : toute la série (équivaut à une position après le dernier tome). Signalé en permanence à l'écran par un bandeau ; un lien partagé ne l'active jamais à l'insu de celui qui l'ouvre.
- **Favoris** : le personnage remonte en haut de la liste.
- **Connus** (« je sais qui c'est ») : le personnage est replié ou grisé. On enregistre la position au moment du marquage ; si un nouveau fait devient visible ensuite, une pastille « nouveau » le signale. Filtre pour afficher ou masquer les connus, et possibilité d'annuler.

Le code d'accès aux réglages est isolé dans un module `settings`, pour pouvoir le brancher plus tard sur un service avec comptes (par exemple Supabase) si la synchronisation entre appareils devient nécessaire. La position peut aussi être placée dans l'URL (`?at=gs`) pour la partager ou la mettre en favori.

## Position plus fine (plus tard)

Beaucoup de lecteurs écoutent les livres en audio et ne voient pas les numéros de chapitres. Si on découpe plus finement, piste envisagée : choisir la **partie** du tome (annoncée par le narrateur), puis un **jalon d'histoire** à l'intérieur (« Darrow vient d'arriver à l'Institut »), rédigé sans révéler la suite. Chaque jalon correspondrait en interne à une position. Un sélecteur par chapitre pourrait rester en option pour les lecteurs papier.

## Interface

- Champ de recherche toujours visible en haut, recherche tolérante aux fautes et aux accents.
- Position de lecture dans l'en-tête (« Golden Son »), modifiable d'un pouce.
- Liste de fiches repliables : nom, couleur, une ligne de résumé ; on touche pour déplier.
- Boutons favori et connu bien visibles (pas seulement par balayage).
- Cibles tactiles d'au moins 44 points.
- Mode sombre, selon le réglage du téléphone par défaut.
- PWA installable sur l'écran d'accueil et utilisable hors ligne.

## Stack technique

| Besoin | Choix |
|---|---|
| Base | Vite, React, TypeScript 7 |
| Lint | Oxlint (`--type-aware`) |
| Données | YAML, converti en JSON au build |
| Validation | Zod |
| Recherche floue | Fuse.js ou fonction maison |
| Interface multilingue | Fichiers de chaînes par langue (i18next si ça grossit) |
| Hors ligne | vite-plugin-pwa |
| Tests | Vitest |
| Hébergement | Site statique (Cloudflare Pages ou GitHub Pages) |

Pas de serveur ni de base de données : les données sont petites, changent rarement et sont versionnées dans git.
