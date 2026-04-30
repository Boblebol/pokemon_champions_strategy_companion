# Assistant stratégique Pokémon Champions

Application web locale pour auditer une équipe Pokémon Champions à partir d'un paste Showdown.

## Fonctionnalités V1.2

- Assistant de configuration en 3 étapes : format, équipe, analyse.
- Interface française plus graphique avec cartes d'équipe, audit et menaces méta.
- Import d'un paste Pokémon Showdown.
- Constructeur d'équipe intégré sur 6 slots avec Pokémon disponibles, attaques disponibles, objet, talent, nature, EV et commentaire par slot.
- Export Showdown généré automatiquement depuis le constructeur.
- Choix du format : Champions VGC, Champions BSS ou Champions OU.
- Sélection de match adaptée au format : 3 Pokémon joués en Champions BSS, 4 en Champions VGC, 6 en Champions OU.
- Analyse séparée du roster complet et de la sélection jouée pour mieux lire les faiblesses/résistances du 3v3.
- Audit défensif, couverture offensive, rôles et repères vitesse.
- Classement des menaces méta selon les usages et la pression sur l'équipe.
- Tentative de mise à jour depuis les statistiques Smogon chaos les plus récentes vérifiées.
- Fallback local explicite si le réseau, Smogon ou CORS bloque le fetch.

## Workflow recommandé

1. Choisir le format cible dans l'assistant.
2. Construire le roster dans les 6 slots ou coller un paste Showdown existant.
3. Cocher les slots joués pour simuler la sélection de match.
4. Lire d'abord l'analyse de la sélection jouée, puis ajuster le roster complet.
5. Cliquer sur `Mettre à jour` pour tenter de récupérer les derniers usages Smogon disponibles.

Les commentaires restent dans le constructeur pour tes notes de plan de jeu. Ils ne sont pas injectés dans l'export Showdown.

## Données

Au 30 avril 2026, le dernier mois publié dans l'index public Smogon `/stats/` est `2026-03`.

La V1.2 cible ces snapshots :

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
