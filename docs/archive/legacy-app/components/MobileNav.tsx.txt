const MOBILE_NAV_ITEMS = [
  { href: '#builder', label: 'Équipe' },
  { href: '#selected-analysis', label: 'Sélection' },
  { href: '#combat', label: 'Combat' },
  { href: '#analysis-dashboard', label: 'Analyse' },
  { href: '#data-status', label: 'Données' },
];

export function MobileNav() {
  return (
    <nav className="mobile-app-nav" aria-label="Navigation mobile app">
      {MOBILE_NAV_ITEMS.map((item) => (
        <a href={item.href} key={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
