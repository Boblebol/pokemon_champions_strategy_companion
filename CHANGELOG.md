# Changelog

## Unreleased

- À venir.

## 0.2.0-beta.5 - 2026-05-07

- Produit: ajout de l'expérience mobile tactile unique, de la landing PWA et des
  routes publiques d'installation.
- Match: ajout du bloc `Team adverse` avec 6 slots adverses, anti-doublon,
  ranking des menaces et cartes cliquables synchronisées avec Combat.
- Combat: synchronisation des adversaires depuis Match, maintien de deux
  sélecteurs en mode 2v2 et sélection adversaire sans doublon.
- Build: alignement des sélecteurs avec la maquette, libellés FR/EN cohérents,
  attaques limitées au movepool et choix uniques par slot.
- Dépendances: mise à jour des actions GitHub, de `jsdom` et de `typescript`
  avant la release.
- QA: couverture Vitest et Playwright étendue sur le shell mobile, la PWA, les
  sélecteurs et les flows Combat 1v1/2v2.

## 0.2.0-beta.4 - 2026-05-04

- Données: alignement des formats Champions sur les slugs et noms Showdown
  dédiés.
- Produit: préparation du mode PWA et des routes app/landing.

## 0.2.0-beta.3 - 2026-05-03

- UI: masque la navigation principale sur le cockpit app pour garder l'outil
  plein écran, tout en conservant la navigation sur les pages landing et docs.

## 0.2.0-beta.2 - 2026-05-03

- Release: déclaration directe de `esbuild` pour rendre la génération de
  référence reproductible en CI fraîche.

## 0.2.0-beta.1 - 2026-05-03

- CI et QA: ajout d'un workflow de vérification, durcissement Vitest et audit
  dépendances, smoke Lightpanda et budget bundle.
- Produit: ajout des routes app/landing/docs, sauvegardes locales multi-équipes,
  export Markdown de l'analyse et explication des scores de menaces.
- Données: génération de la référence Pokémon au build, durcissement du fetch
  PokéAPI et refresh Smogon configurable avec fallback offline.
- Documentation: clarification du positionnement, de la confidentialité, du guide
  utilisateur et du processus de release.
- Performance: split des routes, calcul combat différé et réduction du bundle
  initial.
