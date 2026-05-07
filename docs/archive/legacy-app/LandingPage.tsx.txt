import { pageHref } from '../routing';
import { MarketingFooter, PageNav } from './navigation';

function LandingHeroVisual() {
  return (
    <div className="hero-visual landing-product-shot" aria-hidden="true">
      <div className="match-strip">
        <span>Avant-match</span>
        <strong>6 vers 3</strong>
      </div>
      <div className="match-board">
        {['Dragonite', 'Kingambit', 'Kangaskhan', 'Slot libre', 'Slot libre', 'Slot libre'].map((slot, index) => (
          <div className={`board-slot ${index < 3 ? 'picked' : ''}`} key={`${slot}-${index}`}>
            <span>{index + 1}</span>
            <strong>{slot}</strong>
            <small>{index < 3 ? 'Choix conseillé' : "Reste dans l'équipe"}</small>
          </div>
        ))}
      </div>
      <div className="threat-radar">
        <span>Adversaire dangereux</span>
        <strong>Palafin</strong>
        <small>Jet Punch · pression prioritaire</small>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="product-shell marketing-page">
      <section className="marketing-hero standalone-landing" aria-label="Présentation marketing">
        <PageNav compact />
        <div className="hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">Formats Pokémon Showdown pour Pokémon Champions</span>
            <h1>Gagne du temps au team preview</h1>
            <p>
              Construis ton équipe, choisis les Pokémon qui jouent et repère tout de suite ce qui compte :
              dégâts, points faibles, vitesses importantes et adversaires dangereux même peu joués.
            </p>
            <div className="hero-actions">
              <a className="primary-cta" href={pageHref('app')}>
                Ouvrir l'app
              </a>
              <a className="secondary-cta" href={pageHref('docs')}>
                Ouvrir la doc
              </a>
            </div>
            <dl className="hero-proof">
              <div>
                <dt>Équipe de 6</dt>
                <dd>Pokémon, objets, attaques, images, noms FR et notes au même endroit</dd>
              </div>
              <div>
                <dt>Formats Showdown Champions</dt>
                <dd>[Champions] BSS Reg M-A, [Champions] VGC 2026 Reg M-A et [Champions] OU</dd>
              </div>
              <div>
                <dt>Combat rapide</dt>
                <dd>dégâts donnés et reçus avec bonus, terrain, météo et Téracristallisation</dd>
              </div>
              <div>
                <dt>Adversaires rares</dt>
                <dd>attaques dangereuses possibles depuis les listes complètes</dd>
              </div>
            </dl>
          </div>
          <LandingHeroVisual />
        </div>
      </section>

      <section className="landing-band">
        <div className="landing-section-heading">
          <span className="eyebrow">Workflow</span>
          <h2>De l'idée de team au plan de match</h2>
          <p>La landing reste marketing. L'app reste un cockpit de travail, sans friction locale inutile.</p>
        </div>
        <div className="landing-feature-grid">
          <article>
            <strong>Aligné Showdown Champions</strong>
            <p>L'équipe complète reste visible, avec des sélections 3, 4 ou 6 selon le format choisi.</p>
          </article>
          <article>
            <strong>Données exploitables</strong>
            <p>Les usages Smogon, les données locales et la mise à jour restent visibles et faciles à comprendre.</p>
          </article>
          <article>
            <strong>Décision rapide</strong>
            <p>Tu vois les types couverts, les faiblesses, les vitesses et les profils adverses à préparer.</p>
          </article>
        </div>
      </section>

      <section className="landing-band landing-band-contrast">
        <div className="landing-section-heading">
          <span className="eyebrow">Pourquoi l'utiliser</span>
          <h2>Moins de tableurs, plus de décisions</h2>
        </div>
        <div className="landing-metrics">
          <div>
            <strong>BSS</strong>
            <span>Reg M-A, 3 choix sur 6, niveau 50</span>
          </div>
          <div>
            <strong>Niveaux 50/100</strong>
            <span>calculs alignés sur le format Showdown</span>
          </div>
          <div>
            <strong>Learnsets</strong>
            <span>adversaires possibles même peu joués</span>
          </div>
          <div>
            <strong>Local-first</strong>
            <span>fonctionne même sans refresh réseau</span>
          </div>
        </div>
        <div className="landing-final-cta">
          <a className="primary-cta" href={pageHref('app')}>
            Ouvrir l'app
          </a>
          <a className="secondary-cta" href={pageHref('docs')}>
            Ouvrir la doc
          </a>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
