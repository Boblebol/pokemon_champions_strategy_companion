const PERSONAL_SITE_URL = 'https://alexandre-enouf.fr';
const REPOSITORY_URL = 'https://github.com/Boblebol/pokemon_champions_strategy_companion';

export function ProjectCreditPanel() {
  return (
    <section className="panel project-credit-card" aria-label="Infos projet et créateur">
      <div>
        <span className="eyebrow">Projet maison</span>
        <h2>Coin du dresseur</h2>
        <p>
          Fait par <strong>Alexandre Enouf</strong>, avec du café, des calculs et une tolérance très limitée pour les
          mauvais matchups.
        </p>
      </div>
      <div className="project-credit-links" aria-label="Liens projet">
        <a href={PERSONAL_SITE_URL} target="_blank" rel="noreferrer">
          Site perso
        </a>
        <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
          Repo GitHub
        </a>
      </div>
    </section>
  );
}
