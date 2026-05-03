# Assistant stratégique Pokémon Champions

Compagnon local-first pour préparer une équipe Pokémon Champions dans le
navigateur. L'app permet d'importer un paste Pokémon Showdown, de construire une
équipe avec le builder intégré, de choisir une sélection de match 3v3, d'analyser
les menaces et de simuler les dégâts avec le calculateur Combat.

Les équipes restent côté navigateur. Le refresh Smogon est une tentative
best-effort pour récupérer des statistiques publiques récentes ; si le réseau,
Smogon ou CORS échoue, les snapshots locaux et les données démo restent
utilisables hors ligne. Les sprites Pokémon et icônes d'objets peuvent encore
être chargés depuis des URLs publiques issues de PokéAPI.

Repository public : <https://github.com/Boblebol/pokemon_champions_strategy_companion>

Démo publique : <https://boblebol.github.io/pokemon_champions_strategy_companion/>

Pages :

- Landing : <https://boblebol.github.io/pokemon_champions_strategy_companion/>
- App : <https://boblebol.github.io/pokemon_champions_strategy_companion/app>
- Documentation : <https://boblebol.github.io/pokemon_champions_strategy_companion/docs>

Documentation repo :

- [Guide utilisateur](docs/user-guide.md)
- [Données et confidentialité](docs/data-and-privacy.md)
- [Plan produit](docs/product-plan.md)
- [Checklist release](docs/release-checklist.md)

## Fonctionnalités

- Assistant de départ optionnel et repliable : format, équipe, sélection, Combat,
  analyse.
- Landing marketing séparée, cockpit applicatif séparé et documentation
  utilisateur dédiée.
- Interface française avec cartes d'équipe, audit et adversaires dangereux.
- Import d'un paste Pokémon Showdown ou d'un fichier `.txt` Showdown.
- Constructeur d'équipe guidé sur 6 slots avec parcours étape par étape,
  Pokémon, attaques, objet, talent, nature, points d'entraînement (EV) et notes
  privées.
- Recherche Pokémon et objets en français, triée alphabétiquement, avec image,
  description d'objet et compatibilité Showdown en anglais.
- Calculateur Combat après validation de la sélection : dégâts donnés, dégâts
  reçus les plus dangereux, boosts, météo, terrain, protections par côté,
  brûlure, coup critique, Téracristallisation et recherche rapide adversaire.
- Images Pokémon dans le constructeur, l'équipe et les panneaux de dangers via
  les URLs publiques `PokeAPI/sprites`, sans stocker les images dans le repo.
- Noms localisés FR/EN/JA pour Pokémon, attaques, objets, talents, natures et
  types. L'UI privilégie le français, mais les valeurs internes et l'export
  restent compatibles Pokémon Showdown en anglais.
- Référence complète Gen 9 via `@pkmn/dex` et `@pkmn/data` : Pokémon, talents,
  learnsets, objets et natures.
- Export Showdown généré automatiquement depuis le constructeur, avec téléchargement
  `.txt` depuis l'assistant.
- Formats cibles : Champions 3v3 niveau 100, Champions VGC 4v4 Duo et
  Champions OU.
- Sélection de match adaptée au format : 3 Pokémon en Champions 3v3, 4 en VGC
  4v4 Duo, 6 en OU.
- Analyse séparée de l'équipe complète et de la sélection jouée.
- Audit défensif, types que tes attaques menacent, rôles et vitesses exactes.
- Classement des adversaires fréquents dangereux selon les usages et la pression
  sur l'équipe.
- Adversaires rares dangereux depuis les attaques apprenables complètes, avec
  attaques super efficaces possibles, vitesse max et profils de sets compacts.
- Tentative de mise à jour depuis les statistiques Smogon chaos disponibles.
- Fallback local explicite si le réseau, Smogon ou CORS bloque la mise à jour.

## Démarrage rapide

```bash
pnpm install
pnpm run dev
```

En local, la racine ouvre directement le cockpit applicatif. La landing reste
accessible via `/landing` et la documentation via `/docs`.

## Workflow recommandé

1. Choisir le format cible dans l'assistant de départ ou le sélecteur dédié.
2. Construire l'équipe dans les 6 slots, coller un paste Showdown existant ou
   importer un fichier `.txt`.
3. Cocher les slots joués pour simuler la sélection de match.
4. Simuler un adversaire dans le panneau Combat pour comparer les dégâts que tu
   fais et les dégâts que tu peux recevoir.
5. Lire l'analyse de la sélection jouée, puis ajuster l'équipe complète.
6. Télécharger l'export `.txt` pour conserver ou partager l'équipe.
7. Cliquer sur `Mettre à jour` pour tenter de récupérer les derniers usages
   Smogon disponibles.

L'assistant de départ peut être masqué. L'app garde ce choix en local et affiche
un résumé compact pour rouvrir l'assistant.

Les commentaires restent dans le constructeur pour les notes de plan de jeu. Ils
ne sont pas injectés dans l'export Showdown.

L'import fichier lit un export texte Pokémon Showdown et remplace le paste
courant. L'export fichier télécharge le paste actuel sous
`pokemon-champions-team.txt`.

## Formats

- `Champions 3v3` : combat solo, équipe de 6, sélection de 3, niveau 100.
- `Champions VGC 4v4 Duo` : combat duo, équipe de 6, sélection de 4, niveau 50.
- `Champions OU` : combat 6v6, équipe de 6, sélection de 6, niveau 100.

Le format pilote le niveau utilisé par l'audit, les vitesses, le nombre de
Pokémon joués et le mode par défaut du calculateur Combat.

## Calculateur Combat

Le panneau Combat utilise `@smogon/calc` pour calculer les dégâts depuis la
sélection jouée :

- 1 allié actif en Champions 3v3 et OU, 2 alliés actifs en Champions VGC 4v4 Duo.
- 1 adversaire en solo, jusqu'à 2 adversaires en duo.
- Recherche adversaire locale FR/EN, insensible aux accents.
- Dégâts donnés depuis les attaques du set ou toutes les attaques apprenables.
- Dégâts reçus classés depuis les attaques apprenables de l'adversaire.
- Modificateurs : boosts, Téracristallisation, brûlure, coup critique, météo, terrain, protections
  alliées et protections adverses.

## Données

Au 30 avril 2026, le dernier mois publié dans l'index public Smogon `/stats/`
est `2026-03`.

Les snapshots locaux actuellement ciblés sont :

- `gen9vgc2026regf-1760.json` pour Champions VGC 4v4 Duo
- `gen9bssregi-1760.json` pour Champions 3v3
- `gen9nationaldex-1760.json` pour Champions OU

Des données démo typées restent incluses pour que l'app fonctionne hors ligne.
La référence de construction est générée localement depuis les packages `@pkmn`
afin de proposer les Pokémon, attaques apprenables, objets et natures sans API
payante ni scraping côté client.

Les métadonnées visuelles et localisées sont générées depuis les CSV publics de
PokéAPI et les URLs du repository `PokeAPI/sprites`. Le repo stocke uniquement
les noms et URLs nécessaires ; les fichiers image ne sont pas vendorizés.

## Limites connues

- Les IV ne sont pas encore éditables dans le constructeur.
- Les commentaires de set restent privés au constructeur et ne sont pas exportés
  dans le paste Showdown.
- Le calculateur Combat couvre les modificateurs principaux, mais les cas très
  spécifiques doivent encore être recoupés avec Showdown ou un calculateur dédié.
- Les chunks Vite sont volumineux à cause de `@pkmn`, des learnsets et de
  `@smogon/calc`.

Rafraîchir ces métadonnées :

```bash
pnpm run fetch:assets
```

Cette commande nécessite un accès réseau et régénère
`src/data/generated/pokeAssets.ts` puis la référence Pokémon générée. Pour une
génération reproductible, pinner le commit `PokeAPI/pokeapi` utilisé :

```bash
POKEAPI_DATA_REF=<commit-sha> pnpm run fetch:assets
```

## Développement

Vérification complète :

```bash
pnpm run check
```

Commandes utiles :

```bash
pnpm run lint
pnpm run test
pnpm run build
pnpm run fetch:assets
make dev
make check
```

## Liens

- Portfolio : <https://alexandre-enouf.fr>
- Repository public : <https://github.com/Boblebol/pokemon_champions_strategy_companion>
- Démo publique : <https://boblebol.github.io/pokemon_champions_strategy_companion/>

## Licence

[MIT](LICENSE)
