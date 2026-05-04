import { pageHref } from '../routing';
import { MarketingFooter, PageNav } from './navigation';

export default function DocsPage() {
  return (
    <main className="product-shell docs-page">
      <PageNav tone="light" />
      <section className="docs-shell" aria-label="Documentation">
        <header className="docs-hero">
          <span className="eyebrow">Guide utilisateur</span>
          <h1>Documentation Champions Companion</h1>
          <p>
            Une référence courte pour comprendre le workflow, les formats Pokémon Showdown pour Pokémon Champions, le
            calcul Combat, les données utilisées et les limites actuelles.
          </p>
          <div className="hero-actions">
            <a className="primary-cta" href={pageHref('app')}>
              Ouvrir l'app
            </a>
            <a className="secondary-cta" href={pageHref('landing')}>
              Voir la landing
            </a>
          </div>
        </header>

        <div className="docs-grid">
          <article>
            <h2>1. Démarrer avec l'assistant</h2>
            <p>
              L'assistant de départ est optionnel et repliable. Il garde sous les yeux le format, l'équipe complète,
              les Pokémon joués, le Combat et les priorités d'analyse sans bloquer le cockpit.
            </p>
          </article>
          <article>
            <h2>2. Choisir le format</h2>
            <p>
              Les formats sont les tiers Pokémon Showdown pour Pokémon Champions : [Champions] BSS Reg M-A en Solo
              Flat Rules, [Champions] VGC 2026 Reg M-A en Duo Flat Rules, et [Champions] OU pour le 6v6.
            </p>
          </article>
          <article>
            <h2>3. Construire l'équipe</h2>
            <p>
              Utilise les menus du constructeur pour choisir un Pokémon, son talent, son objet, sa nature, ses points
              d'entraînement (EV) et ses quatre attaques disponibles dans la source locale filtrée. Les libellés sont affichés
              en français quand PokéAPI les fournit. Tu peux aussi importer un fichier .txt Showdown ou exporter
              l'équipe actuelle en .txt ; le contenu reste en anglais compatible Showdown.
            </p>
          </article>
          <article>
            <h2>Source du roster</h2>
            <p>
              Le roster local vient du mod Pokémon Showdown <code>champions</code>. Les entrées marquées{' '}
              <code>Illegal</code> dans <code>data/mods/champions/formats-data.ts</code> ne sont pas proposées dans le
              constructeur. Les formes qui ne correspondent pas à un slot d'équipe directement sélectionnable, comme
              les Méga, Gigamax, Primo, Eternamax, Totem ou formes battle-only, ne sont pas proposées comme Pokémon
              séparés.
            </p>
          </article>
          <article>
            <h2>4. Verrouiller les Pokémon joués</h2>
            <p>
              Les panneaux défensifs, offensifs, adversaires fréquents, vitesses et adversaires rares deviennent beaucoup plus
              utiles quand la sélection jouée est complète : 3 en [Champions] BSS Reg M-A, 4 en [Champions] VGC 2026
              Reg M-A, 6 en [Champions] OU.
            </p>
          </article>
          <article>
            <h2>5. Simuler le combat</h2>
            <p>
              Le panneau Combat calcule les dégâts que tu fais et les dégâts que tu peux recevoir avec
              <code>@smogon/calc</code>. Il prend en compte niveau du format, boosts, météo, terrain, protections par
              côté, brûlure, coup critique, Téracristallisation et attaques apprenables.
            </p>
          </article>
          <article>
            <h2>6. Lire les attaques dangereuses</h2>
            <p>
              Le panneau des adversaires rares scanne toutes les attaques apprenables pour trouver les Pokémon capables
              de toucher ta sélection super efficacement, puis propose une vitesse max et des profils de sets.
            </p>
          </article>
          <article>
            <h2>Données locales</h2>
            <p>
              La référence de construction vient de <code>@pkmn/dex</code> et <code>@pkmn/data</code>. Les images et
              noms localisés viennent d'une copie locale des métadonnées PokéAPI, sans vendorer les fichiers image.
            </p>
          </article>
          <article>
            <h2>Données et refresh</h2>
            <p>
              Le refresh Smogon peut échouer si le réseau, Smogon ou CORS bloque la requête. Les noms localisés et URLs
              d'images viennent d'une copie locale des métadonnées PokéAPI, donc l'app garde les données locales et reste utilisable
              offline côté données.
            </p>
          </article>
          <article>
            <h2>Limites connues</h2>
            <p>
              Le calcul Combat couvre les modificateurs essentiels, mais les IV ne sont pas encore éditables dans le
              constructeur et certains cas ultra spécifiques peuvent demander une vérification Showdown.
            </p>
          </article>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
