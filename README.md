# Assistant stratégique Pokémon Champions

Application web locale pour auditer une équipe Pokémon Champions à partir d'un
paste Pokémon Showdown ou d'un constructeur d'équipe intégré.

Repository public : <https://github.com/Boblebol/pokemon_champions_strategy_companion>

Démo publique : <https://boblebol.github.io/pokemon_champions_strategy_companion/>

## Fonctionnalités

- Assistant de configuration en étapes : format, équipe, sélection, analyse.
- Interface française avec cartes d'équipe, audit et menaces méta.
- Import d'un paste Pokémon Showdown.
- Constructeur d'équipe guidé sur 6 slots avec funnel, édition slot par slot,
  Pokémon, attaques, objet, talent, nature, EV et notes privées.
- Référence complète Gen 9 via `@pkmn/dex` et `@pkmn/data` : Pokémon, talents,
  learnsets, objets et natures.
- Export Showdown généré automatiquement depuis le constructeur.
- Formats cibles : Champions 3v3 niveau 100, Champions VGC et Champions OU.
- Sélection de match adaptée au format : 3 Pokémon en Champions 3v3, 4 en VGC,
  6 en OU.
- Analyse séparée du roster complet et de la sélection jouée.
- Audit défensif, couverture offensive, rôles et speed tiers exacts.
- Classement des menaces méta selon les usages et la pression sur l'équipe.
- Menaces possibles hors méta depuis les learnsets complets, avec coverage
  possible, vitesse max et archétypes de sets compacts.
- Tentative de mise à jour depuis les statistiques Smogon chaos disponibles.
- Fallback local explicite si le réseau, Smogon ou CORS bloque la mise à jour.

## Workflow recommandé

1. Choisir le format cible dans l'assistant.
2. Construire le roster dans les 6 slots ou coller un paste Showdown existant.
3. Cocher les slots joués pour simuler la sélection de match.
4. Lire l'analyse de la sélection jouée, puis ajuster le roster complet.
5. Cliquer sur `Mettre à jour` pour tenter de récupérer les derniers usages
   Smogon disponibles.

Les commentaires restent dans le constructeur pour les notes de plan de jeu. Ils
ne sont pas injectés dans l'export Showdown.

## Données

Au 30 avril 2026, le dernier mois publié dans l'index public Smogon `/stats/`
est `2026-03`.

La V1.2 cible ces snapshots :

- `gen9vgc2026regf-1760.json` pour Champions VGC
- `gen9bssregi-1760.json` pour Champions 3v3
- `gen9nationaldex-1760.json` pour Champions OU

Des snapshots demo typés restent inclus pour que l'app fonctionne hors ligne.
La référence de construction est générée localement depuis les packages `@pkmn`
afin de proposer les Pokémon, attaques apprenables, objets et natures sans API
payante ni scraping côté client.

## Développement

```bash
pnpm install
pnpm run dev
```

Vérification complète :

```bash
pnpm run check
```

Commandes utiles :

```bash
pnpm run lint
pnpm run test
pnpm run build
make dev
make check
```

## Liens

- Portfolio : <https://alexandre-enouf.fr>
- Repository public : <https://github.com/Boblebol/pokemon_champions_strategy_companion>
- Démo publique : <https://boblebol.github.io/pokemon_champions_strategy_companion/>

## Licence

[MIT](LICENSE)
