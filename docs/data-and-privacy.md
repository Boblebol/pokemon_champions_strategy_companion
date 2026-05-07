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

## PWA et cache

Le service worker met en cache le shell applicatif, les routes principales, le
manifest, les icônes et les assets versionnés générés par Vite. Ce cache sert à
relancer l'app depuis l'écran d'accueil et à garder le cockpit accessible hors
ligne après un premier chargement.

Sur iOS et iPadOS, l'installation se fait depuis Safari avec `Sur l'écran
d'accueil`. Sur Android, elle se fait depuis Chrome ou un navigateur compatible
PWA avec `Installer l'application` ou `Ajouter à l'écran d'accueil`.

Le cache PWA ne transforme pas le refresh Smogon en donnée garantie. Les appels
live restent dépendants du réseau et de Smogon ; en cas d'échec, les snapshots
locaux restent la source utilisée.

## Sources de format

Les formats suivis sont les tiers Pokémon Showdown pour Pokémon Champions :
`[Champions] BSS Reg M-A`, `[Champions] VGC 2026 Reg M-A` et `[Champions] OU`.
Le roster local est filtré depuis le mod Pokémon Showdown `champions`; les
entrées marquées `Illegal` dans `data/mods/champions/formats-data.ts` ne sont pas
proposées dans le constructeur. Les formes qui ne correspondent pas à un slot
d'équipe directement sélectionnable, comme les Méga, Gigamax, Primo, Eternamax,
Totem ou formes battle-only, ne sont pas proposées comme Pokémon séparés.

## Limites

Le mode local-first ne garantit pas que les données live soient les plus
récentes. La date du snapshot affichée dans l'app reste la source de vérité.
