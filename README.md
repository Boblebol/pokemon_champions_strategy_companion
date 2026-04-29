# Assistant stratégique Pokémon Champions

Application web locale pour auditer une équipe Pokémon Champions à partir d'un paste Showdown.

## Fonctionnalités V1.1

- Assistant de configuration en 3 étapes : format, équipe, analyse.
- Interface française plus graphique avec cartes d'équipe, audit et menaces méta.
- Import d'un paste Pokémon Showdown.
- Choix du format : Champions VGC, Champions BSS ou Champions OU.
- Audit défensif, couverture offensive, rôles et repères vitesse.
- Classement des menaces méta selon les usages et la pression sur l'équipe.
- Tentative de mise à jour depuis les statistiques Smogon chaos les plus récentes vérifiées.
- Fallback local explicite si le réseau, Smogon ou CORS bloque le fetch.

## Données

Au 29 avril 2026, le dernier mois publié dans l'index public Smogon `/stats/` est `2026-03`.

La V1.1 cible ces snapshots :

- `gen9vgc2026regf-1760.json` pour Champions VGC
- `gen9bssregi-1760.json` pour Champions BSS
- `gen9nationaldex-1760.json` pour Champions OU

Des snapshots demo typés restent inclus pour que l'app fonctionne hors ligne.

## Développement

```bash
npm install
npm run dev
```

Vérification complète :

```bash
npm run check
```

Commandes utiles :

```bash
npm run lint
npm run test
npm run build
```
