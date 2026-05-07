import { pageHref } from '../routing';

const IOS_STEPS = ['Ouvre cette page dans Safari.', 'Touche Partager.', "Choisis Sur l'écran d'accueil."];
const ANDROID_STEPS = ['Ouvre cette page dans Chrome.', 'Ouvre le menu du navigateur.', "Choisis Installer l'application."];

function InstallSteps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <article className="pwa-install-card">
      <h3>{title}</h3>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}

export default function LandingPage() {
  return (
    <main className="product-shell pwa-landing-page" aria-label="Présentation PWA Champions">
      <section className="marketing-hero pwa-landing-hero" aria-label="Présentation PWA">
        <nav className="site-nav dark pwa-landing-nav" aria-label="Navigation landing PWA">
          <a className="brand-link" href={pageHref('landing')}>
            Champions Companion
          </a>
          <a href={pageHref('app')}>Ouvrir l'app</a>
        </nav>

        <div className="pwa-hero-copy">
          <p className="eyebrow">PWA installable</p>
          <h1>Champions Companion</h1>
          <p>
            Prépare ta team Pokémon Champions depuis le navigateur, puis installe l'app sur l'écran d'accueil pour
            retrouver le builder, les actifs et le match sans passer par un store.
          </p>
          <div className="pwa-hero-actions">
            <a className="primary-cta" href={pageHref('app')}>
              Ouvrir l'app
            </a>
            <a className="secondary-cta" href="#installer">
              Comment installer
            </a>
          </div>
        </div>
      </section>

      <section className="landing-band pwa-install-section" id="installer" aria-labelledby="installer-title">
        <div className="landing-section-heading">
          <p className="eyebrow">Installation</p>
          <h2 id="installer-title">Comment l'installer</h2>
          <p>
            La PWA utilise le manifest et le service worker du site. L'app démarre directement sur `/app` une fois
            ajoutée à l'écran d'accueil.
          </p>
        </div>

        <div className="pwa-install-grid">
          <InstallSteps title="Installer sur iPhone" steps={IOS_STEPS} />
          <InstallSteps title="Installer sur Android" steps={ANDROID_STEPS} />
        </div>
      </section>

      <section className="landing-band pwa-app-link-band" aria-label="Accès application">
        <div>
          <p className="eyebrow">Application</p>
          <h2>Accès direct au builder</h2>
          <p>
            Le lien ci-dessous ouvre la vraie app mobile : données Champions locales, recherche Pokémon, movepools,
            sauvegardes navigateur et analyse de match.
          </p>
        </div>
        <a className="primary-cta" href={pageHref('app')}>
          Ouvrir l'app
        </a>
      </section>
    </main>
  );
}
