# Données et confidentialité

## Données locales

Les équipes collées ou construites restent dans le navigateur. L'application ne
crée pas de compte, ne stocke pas de clé API et n'envoie pas les équipes vers un
backend applicatif.

## Stockage navigateur

L'assistant de démarrage utilise `localStorage` pour mémoriser son état affiché
ou masqué.

## Réseau

Le refresh Smogon tente de récupérer des statistiques publiques. En cas d'échec,
les snapshots locaux restent utilisés. Les sprites et icônes peuvent être chargés
depuis des URL publiques issues des données PokéAPI.

## Limites

Le mode local-first ne garantit pas que les données live soient les plus
récentes. La date du snapshot affichée dans l'app reste la source de vérité.
