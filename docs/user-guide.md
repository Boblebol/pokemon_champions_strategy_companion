# Guide utilisateur Champions Companion

Ce guide complète la documentation intégrée de l'app. Il décrit le workflow local
recommandé pour préparer une sélection Pokémon Champions.

## Parcours rapide

1. Ouvrir l'app locale ou la page publique `/app`.
2. Choisir le format : `Champions 3v3`, `Champions VGC 4v4 Duo` ou
   `Champions OU`.
3. Importer un paste Showdown ou construire les 6 slots dans le constructeur.
4. Cocher les Pokémon réellement joués dans la sélection de match.
5. Utiliser le panneau Combat pour simuler les dégâts contre un ou deux
   adversaires.
6. Lire les panneaux d'audit, de menaces méta, de menaces hors méta et de speed
   tiers.

L'assistant de départ est optionnel. Il peut être masqué, puis rouvert depuis le
résumé compact.

## Formats

| Format | Style | Roster | Sélection | Niveau |
| --- | --- | ---: | ---: | ---: |
| Champions 3v3 | Solo | 6 | 3 | 100 |
| Champions VGC 4v4 Duo | Duo | 6 | 4 | 50 |
| Champions OU | 6v6 | 6 | 6 | 100 |

Le format pilote le niveau des calculs, le nombre de picks, le style de Combat
et le snapshot Smogon utilisé.

## Constructeur

Le constructeur propose les Pokémon, talents, objets, natures et attaques depuis
la référence Gen 9 générée avec `@pkmn/dex` et `@pkmn/data`. L'interface affiche
les noms français quand ils sont disponibles, mais les valeurs internes et
l'export restent compatibles Pokémon Showdown en anglais.

Les commentaires restent privés au constructeur. Ils servent aux notes de plan de
jeu et ne sont pas ajoutés au paste Showdown exporté.

## Calculateur Combat

Le panneau Combat utilise `@smogon/calc`.

Il calcule :

- les dégâts sortants de tes Pokémon actifs vers les adversaires choisis ;
- les dégâts entrants les plus dangereux depuis les attaques apprenables des
  adversaires ;
- les effets des boosts, du Tera, de la brûlure, du critique, de la météo, du
  terrain et des protections par côté.

En Champions VGC 4v4 Duo, la scène peut contenir deux alliés actifs et deux
adversaires. En Champions 3v3 et OU, elle démarre en 1v1.

## Données

L'app fonctionne localement avec des snapshots démo typés. Le bouton
`Mettre à jour` tente de récupérer les derniers usages Smogon disponibles pour le
format courant. Si le réseau, Smogon ou CORS bloque la requête, l'app conserve le
snapshot local et affiche un message explicite.

Les images ne sont pas stockées dans le repo. Le repo conserve uniquement les
URLs publiques et les noms localisés nécessaires à l'affichage.

## Limites connues

- Les IV ne sont pas encore éditables dans le constructeur.
- Les cas de dégâts très spécifiques doivent encore être recoupés avec Showdown.
- Le build contient de gros chunks, principalement à cause des learnsets Gen 9,
  de `@pkmn` et de `@smogon/calc`.
