# Plan produit

## Audience

Joueurs Pokémon Champions qui préparent des équipes pour les formats Pokémon
Showdown `[Champions] BSS Reg M-A`, `[Champions] VGC 2026 Reg M-A` et
`[Champions] OU` avant un match, un entraînement ou un tournoi.

## Promesse

Comprendre les menaces principales, choisir une sélection solide et vérifier les
lignes de dégâts importantes sans quitter le navigateur, avec des libellés et
données alignés sur les tiers Pokémon Showdown pour Pokémon Champions.

## Non-objectifs

- Remplacer Pokémon Showdown.
- Garantir un moteur de simulation parfait pour tous les cas spécifiques.
- Stocker des comptes, des équipes serveur ou des données privées hors du
  navigateur.

## Priorités suivantes

- Sauvegarder plusieurs équipes localement.
- Exporter une analyse lisible de l'équipe et de la sélection jouée.
- Améliorer la fraîcheur des snapshots Smogon et l'état affiché en cas d'échec.
- Ajouter une QA visuelle pour les routes principales et les tailles d'écran clés.

## Critères d'acceptation de la prochaine release

- Le parcours import, builder, sélection et Combat reste utilisable hors ligne
  avec les snapshots locaux.
- Un échec de refresh Smogon affiche un message clair et conserve les données
  locales.
- Les pages `/`, `/landing`, `/app` et `/docs` se construisent et se chargent via
  le fallback GitHub Pages.
- `pnpm run check` passe avant tag de version.
- Le changelog décrit les changements produit, QA et documentation livrés.
