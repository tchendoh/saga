# Backlog

## Technique

- **Convertir le YAML en JSON au build.** Le navigateur reçoit aujourd'hui les fichiers YAML bruts, la bibliothèque `yaml` et Zod, d'où un fichier JavaScript de plus de 500 Ko (avertissement de Vite). Valider et convertir les données au moment du build, pour n'envoyer que du JSON déjà vérifié. À faire avant la PWA.
- **PWA** : installable sur l'écran d'accueil de l'iPhone et utilisable hors ligne (`vite-plugin-pwa`). Les icônes sont prêtes. Nécessite le HTTPS sur saga.chummey.com.

## Données Red Rising

- **Trier les personnages du tome 1** : chaque fiche importée porte un `TODO` pour indiquer si le personnage apparait déjà dans Red Rising (passer `introduced` et les premières entrées à `rr`).
- **Réécrire les brouillons** (`draft: true # à réécrire`) dans nos propres mots, en français et en anglais, avant de faire connaitre le site.
- **Avancer la date de sept morts** importées trop tard (marquées d'un `TODO`).
- **Extraire les relations** des anciennes descriptions (« fils de », « épouse de »…) et des liens de clientèle conservés en commentaires.
- **Personnages secondaires du tome 1** à ajouter (famille de Darrow à Lykos, élèves de l'Institut…).
- **Vérifier les termes de l'édition française** (titres, couleurs, allégeances, particules), marqués `TODO` dans `series.yaml`, ainsi que « of » / « O' » dans l'édition anglaise.

## Interface

- **Mode clair** (le site est en mode sombre seulement), avec une variante lisible pour les couleurs White et Silver.
- **Onglet Lexique** : lieux, maisons, grades et couleurs.
- **Position plus fine que le tome** (parties et jalons d'histoire), voir `vision.md`.
