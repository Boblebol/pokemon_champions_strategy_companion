# Checklist release

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm run check`
- [ ] `pnpm audit --audit-level moderate`
- [ ] Lancer le serveur local : `pnpm exec vite --host 127.0.0.1 --port 5175 --strictPort`
- [ ] Smoke browser : `LIGHTPANDA_BIN=/tmp/lightpanda APP_URL=http://127.0.0.1:5175 pnpm run smoke:browser`
- [ ] Smoke test manuel `/`, `/landing`, `/app`, `/docs`
- [ ] Vérifier mobile 390 px
- [ ] Vérifier mobile 430 px
- [ ] Vérifier tablette 834 px
- [ ] Vérifier tablette paysage 1024 px
- [ ] Vérifier desktop 1440 px
- [ ] Vérifier le fallback des routes statiques GitHub Pages
- [ ] Vérifier qu'un échec Smogon conserve les snapshots locaux
- [ ] Si les métadonnées PokéAPI sont régénérées, utiliser `POKEAPI_DATA_REF=<commit-sha> pnpm run fetch:assets`
- [ ] Mettre à jour `CHANGELOG.md`
- [ ] Tagger la version seulement après validation CI
