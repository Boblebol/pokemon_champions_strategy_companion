# Changelog

## Unreleased

- À venir.

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
