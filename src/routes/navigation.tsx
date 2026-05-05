import { pageHref } from '../routing';

export function PageNav({ tone = 'dark', compact = false }: { tone?: 'dark' | 'light'; compact?: boolean }) {
  return (
    <nav className={`site-nav ${tone}`} aria-label="Navigation principale">
      <a className="brand-link" href={pageHref('landing')}>
        Champions Companion
      </a>
      <div>
        <a href={pageHref('app')}>{compact ? 'App' : "Ouvrir l'app"}</a>
        <a href={pageHref('docs')}>{compact ? 'Doc' : 'Ouvrir la doc'}</a>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="app-footer">
      <span>Assistant stratégique Pokémon Champions · outil local de préparation d'équipe</span>
      <a href="https://alexandre-enouf.fr" target="_blank" rel="noreferrer">
        Alexandre Enouf
      </a>
    </footer>
  );
}
