# Guide utilisateur Champions Companion

Ce guide complète la documentation intégrée de l'app. Il décrit le workflow local
recommandé pour préparer une sélection Pokémon Champions avec les tiers Pokémon
Showdown dédiés à Pokémon Champions.

## Parcours rapide

1. Ouvrir l'app tactile `/app`. `/mobile` reste un alias compatible.
2. Depuis l'accueil, créer une team vide ou charger une sauvegarde locale.
3. Choisir `1v1 actif` pour préparer 3 Pokémon ou `2v2 actif` pour préparer 4
   Pokémon.
4. Remplir seulement les slots nécessaires dans le constructeur ; les 6 slots ne
   sont pas obligatoires pour commencer l'analyse.
5. Dans `Sélection`, chercher les Pokémon réellement joués dans ta team.
6. Lire `Couverture rapide`, puis les adversaires dangereux.
7. Utiliser le panneau Combat pour simuler les dégâts contre un ou deux
   adversaires.

Les onglets `Analyse` et `Combat` restent verrouillés tant que les 3 ou 4 actifs
du mode choisi ne sont pas remplis.

## Installation mobile

L'app est prévue pour fonctionner comme PWA. Sur mobile, elle peut être ajoutée à
l'écran d'accueil depuis le navigateur, sans store. Une fois chargée au moins une
fois, le shell applicatif, les routes principales et les assets versionnés sont
gardés en cache par le service worker.

Sur iOS ou iPadOS :

1. Ouvre `/app` dans Safari.
2. Appuie sur le bouton de partage.
3. Choisis `Sur l'écran d'accueil`.
4. Valide le nom proposé ou renomme l'app.
5. Lance Champions Companion depuis l'icône créée.

Sur Android :

1. Ouvre `/app` dans Chrome ou un navigateur compatible PWA.
2. Ouvre le menu du navigateur.
3. Choisis `Installer l'application` ou `Ajouter à l'écran d'accueil`.
4. Valide l'installation.
5. Lance Champions Companion depuis l'icône créée.

Le statut PWA indique si l'app est en ligne ou hors ligne. Hors
ligne, les données locales et les équipes sauvegardées restent disponibles ; la
mise à jour Smogon attend simplement le retour du réseau.

La landing propose une seule entrée vers `/app`. L'alias `/mobile` utilise les
mêmes données, les mêmes formats, les mêmes calculs et les mêmes exports pour
préserver les anciens liens.

## Formats

| Format Showdown | Style | Équipe | Sélection | Niveau |
| --- | --- | ---: | ---: | ---: |
| [Champions] BSS Reg M-A | Solo Flat Rules | 6 | 3 | 50 |
| [Champions] VGC 2026 Reg M-A | Duo Flat Rules | 6 | 4 | 50 |
| [Champions] OU | 6v6 | 6 | 6 | 100 |

Le format pilote le niveau des calculs, le nombre de Pokémon joués, le style de
Combat et les données d'usage Smogon utilisées. Ces libellés sont les formats
Pokémon Showdown pour Pokémon Champions.

## Constructeur

Le constructeur propose les Pokémon, talents, objets, natures et attaques depuis
la référence locale filtrée par le roster Showdown Champions et générée avec
`@pkmn/dex` et `@pkmn/data`. La recherche
affiche les résultats dans la langue active, triés alphabétiquement, avec images
Pokémon, images d'objets et descriptions d'objets quand la source les fournit.
Les attaques affichent aussi type, catégorie, STAB, puissance, précision et PP.
Les valeurs internes et l'export restent compatibles Pokémon Showdown en anglais.

Le roster local vient du mod Pokémon Showdown `champions`. Il est filtré pour ne
pas proposer les entrées marquées `Illegal` dans
`data/mods/champions/formats-data.ts`. Les formes qui ne correspondent pas à un
slot d'équipe directement sélectionnable, comme les Méga, Gigamax, Primo,
Eternamax, Totem ou formes battle-only, ne sont pas proposées comme Pokémon
séparés dans le constructeur.

Dans l'écran Données, `Exporter l'équipe` télécharge le paste actuel dans
`pokemon-champions-team.txt`, pratique pour le garder localement ou le partager.
La sauvegarde et le chargement des teams sont disponibles dès l'accueil pour
éviter de chercher le management en pleine partie.

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

En `[Champions] VGC 2026 Reg M-A`, la scène peut contenir deux alliés actifs et
deux adversaires. En `[Champions] BSS Reg M-A` et `[Champions] OU`, elle démarre
en 1v1.
Les alliés actifs se sélectionnent par recherche dans la sélection jouée, ce qui
permet de changer vite de lead sans revenir dans le constructeur.

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
