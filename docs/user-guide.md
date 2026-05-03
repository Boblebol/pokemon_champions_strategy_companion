# Guide utilisateur Champions Companion

Ce guide complète la documentation intégrée de l'app. Il décrit le workflow local
recommandé pour préparer une sélection Pokémon Champions.

## Parcours rapide

1. Ouvrir l'app locale ou la page publique `/app`.
2. Choisir le format : `Champions 3v3`, `Champions VGC 4v4 Duo` ou
   `Champions OU`.
3. Importer un paste Showdown, charger un fichier `.txt` ou construire les 6
   slots dans le constructeur.
4. Cocher les Pokémon réellement joués dans la sélection de match.
5. Utiliser le panneau Combat pour simuler les dégâts contre un ou deux
   adversaires.
6. Lire les panneaux d'audit, d'adversaires fréquents dangereux, d'adversaires
   rares dangereux et de vitesses.

L'assistant de départ est optionnel. Il peut être masqué, puis rouvert depuis le
résumé compact.

## Formats

| Format | Style | Équipe | Sélection | Niveau |
| --- | --- | ---: | ---: | ---: |
| Champions 3v3 | Solo | 6 | 3 | 100 |
| Champions VGC 4v4 Duo | Duo | 6 | 4 | 50 |
| Champions OU | 6v6 | 6 | 6 | 100 |

Le format pilote le niveau des calculs, le nombre de Pokémon joués, le style de
Combat et les données d'usage Smogon utilisées.

## Constructeur

Le constructeur propose les Pokémon, talents, objets, natures et attaques depuis
la référence Gen 9 NatDex générée avec `@pkmn/dex` et `@pkmn/data`. La recherche
affiche les résultats en français, triés alphabétiquement, avec images Pokémon,
images d'objets et descriptions d'objets quand la source les fournit. Les valeurs
internes et l'export restent compatibles Pokémon Showdown en anglais.

Dans l'assistant, `Importer un fichier` lit un `.txt` Showdown et remplace
l'équipe courante. `Exporter l'équipe` télécharge le paste actuel dans
`pokemon-champions-team.txt`, pratique pour le garder localement ou le partager.

Les commentaires restent privés au constructeur. Ils servent aux notes de plan de
jeu et ne sont pas ajoutés au paste Showdown exporté.

## Calculateur Combat

Le panneau Combat utilise `@smogon/calc`.

Il calcule :

- les dégâts que tes Pokémon actifs font aux adversaires choisis ;
- les dégâts les plus dangereux que tes Pokémon peuvent recevoir depuis les attaques apprenables des
  adversaires ;
- les effets des boosts, de la Téracristallisation, de la brûlure, du coup
  critique, de la météo, du terrain et des protections par côté.

En Champions VGC 4v4 Duo, la scène peut contenir deux alliés actifs et deux
adversaires. En Champions 3v3 et OU, elle démarre en 1v1.

## Données

L'app fonctionne localement avec des données démo typées. Le bouton
`Mettre à jour` tente de récupérer les derniers usages Smogon disponibles pour le
format courant. Si le réseau, Smogon ou CORS bloque la requête, l'app conserve les
données locales et affiche un message explicite.

Les images ne sont pas stockées dans le repo. Le repo conserve uniquement les
URLs publiques et les noms localisés nécessaires à l'affichage.

Pour le détail des données locales, du stockage navigateur et des accès réseau,
voir [Données et confidentialité](data-and-privacy.md). Les équipes restent dans
le navigateur ; seuls le refresh Smogon et le chargement de sprites ou d'icônes
depuis des URLs publiques peuvent utiliser le réseau.

## Limites connues

- Les IV ne sont pas encore éditables dans le constructeur.
- Les cas de dégâts très spécifiques doivent encore être recoupés avec Showdown.
- Le build contient de gros chunks, principalement à cause des learnsets Gen 9,
  de `@pkmn` et de `@smogon/calc`.
