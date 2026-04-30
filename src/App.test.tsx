import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('opens the app directly on the local root route', () => {
    render(<App />);

    expect(screen.getByLabelText(/cockpit d'analyse/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ouvrir la doc/i })).toHaveAttribute('href', '/docs');
    expect(screen.queryByLabelText(/présentation marketing/i)).not.toBeInTheDocument();
  });

  it('renders a marketing landing page with app and doc entry points', () => {
    window.history.pushState({}, '', '/landing');
    render(<App />);

    const landing = screen.getByLabelText(/présentation marketing/i);
    expect(landing).toBeInTheDocument();
    expect(within(landing).getByRole('heading', { name: /gagne du temps au team preview/i })).toBeInTheDocument();
    expect(within(landing).getByRole('link', { name: /ouvrir l'app/i })).toHaveAttribute('href', '/app');
    expect(within(landing).getByRole('link', { name: /ouvrir la doc/i })).toHaveAttribute('href', '/docs');
    expect(within(landing).getByText(/analyse 3v3 niveau 100/i)).toBeInTheDocument();
    expect(within(landing).getAllByText(/menaces hors méta/i).length).toBeGreaterThan(0);
    expect(within(landing).getByText(/roster de 6/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cockpit d'analyse/i)).not.toBeInTheDocument();
  });

  it('renders a standalone documentation page', () => {
    window.history.pushState({}, '', '/docs');
    render(<App />);

    const docs = screen.getByLabelText(/documentation/i);
    expect(within(docs).getByRole('heading', { name: /documentation champions companion/i })).toBeInTheDocument();
    expect(within(docs).getByRole('link', { name: /ouvrir l'app/i })).toHaveAttribute('href', '/app');
    expect(within(docs).getByText(/1\. choisir le format/i)).toBeInTheDocument();
    expect(within(docs).getByText(/coverage possible/i)).toBeInTheDocument();
    expect(within(docs).getByText(/le refresh smogon peut échouer/i)).toBeInTheDocument();
  });

  it('renders the app route without the landing page', () => {
    window.history.pushState({}, '', '/app');
    render(<App />);

    expect(screen.getByLabelText(/cockpit d'analyse/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ouvrir la doc/i })).toHaveAttribute('href', '/docs');
    expect(screen.queryByLabelText(/présentation marketing/i)).not.toBeInTheDocument();
  });

  it('renders the French graphical wizard and dashboard regions', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /cockpit stratégique/i })).toBeInTheDocument();
    expect(screen.getByText(/1\s+format/i)).toBeInTheDocument();
    expect(screen.getByText(/2\s+équipe/i)).toBeInTheDocument();
    expect(screen.getByText(/3\s+sélection/i)).toBeInTheDocument();
    expect(screen.getByText(/4\s+analyse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/format champions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/équipe showdown/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /audit d'équipe/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /menaces méta/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /menaces possibles hors méta/i })).toBeInTheDocument();
    expect(screen.getAllByText(/coverage possible/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/complète la sélection de 3 pokémon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cockpit d'analyse/i)).toBeInTheDocument();
    expect(screen.getByText(/roster complet/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /plan de match 3v3/i })).toBeInTheDocument();
    expect(screen.getAllByText(/niveau 100/i).length).toBeGreaterThan(0);
  });

  it('renders contextual help for strategy and data freshness', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /aides rapides/i })).toBeInTheDocument();
    expect(screen.getByText(/score de menace/i)).toBeInTheDocument();
    expect(screen.getByText(/données live/i)).toBeInTheDocument();
  });

  it('renders a portfolio footer link', () => {
    render(<App />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alexandre enouf/i })).toHaveAttribute(
      'href',
      'https://alexandre-enouf.fr',
    );
  });

  it('renders the integrated team builder controls', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /constructeur d'équipe/i })).toBeInTheDocument();
    expect(screen.getByText(/étapes constructeur/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /modifier slot 2/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/slot 1 pokémon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slot 1 attaque 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slot 1 ev atk/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/commentaire slot 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jouer slot 1/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /analyse sélection jouée/i })).toBeInTheDocument();
  });

  it('loads the complete Showdown reference in the builder', async () => {
    render(<App />);

    expect(await screen.findByText(/source complète/i, undefined, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Bulbasaur' }, { timeout: 5000 })).toBeInTheDocument();
  });

  it('updates the roster from builder controls and exports the generated paste', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await user.selectOptions(screen.getByLabelText(/slot 2 pokémon/i), 'Dragonite');
    await user.selectOptions(screen.getByLabelText(/slot 2 objet/i), 'Heavy-Duty Boots');
    await user.selectOptions(screen.getByLabelText(/slot 2 attaque 1/i), 'Extreme Speed');
    await user.clear(screen.getByLabelText(/slot 2 ev atk/i));
    await user.type(screen.getByLabelText(/slot 2 ev atk/i), '252');
    await user.type(screen.getByLabelText(/commentaire slot 2/i), 'Win condition prioritaire.');

    const paste = screen.getByLabelText(/équipe showdown/i) as HTMLTextAreaElement;
    expect(paste.value).toContain('Dragonite @ Heavy-Duty Boots');
    expect(paste.value).toContain('EVs: 252 Atk');
    expect(paste.value).not.toContain('Win condition');
    expect(await screen.findAllByText('Dragonite')).not.toHaveLength(0);
  });

  it('filters set dropdowns from the selected Pokémon reference', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await user.selectOptions(screen.getByLabelText(/slot 2 pokémon/i), 'Garchomp');

    const abilitySelect = screen.getByLabelText(/slot 2 talent/i);
    expect(within(abilitySelect).getByRole('option', { name: 'Rough Skin' })).toBeInTheDocument();
    expect(within(abilitySelect).queryByRole('option', { name: 'Multiscale' })).not.toBeInTheDocument();
    await user.selectOptions(abilitySelect, 'Rough Skin');

    const firstMoveSelect = screen.getByLabelText(/slot 2 attaque 1/i);
    expect(within(firstMoveSelect).getByRole('option', { name: 'Earthquake' })).toBeInTheDocument();
    expect(within(firstMoveSelect).queryByRole('option', { name: 'Moonblast' })).not.toBeInTheDocument();
    await user.selectOptions(firstMoveSelect, 'Earthquake');
    await user.selectOptions(screen.getByLabelText(/slot 2 objet/i), 'Rocky Helmet');
    await user.selectOptions(screen.getByLabelText(/slot 2 type tera/i), 'Ground');
    await user.selectOptions(screen.getByLabelText(/slot 2 nature/i), 'Jolly');

    const paste = screen.getByLabelText(/équipe showdown/i) as HTMLTextAreaElement;
    expect(paste.value).toContain('Garchomp @ Rocky Helmet');
    expect(paste.value).toContain('Ability: Rough Skin');
    expect(paste.value).toContain('Tera Type: Ground');
    expect(paste.value).toContain('Jolly Nature');
    expect(paste.value).toContain('- Earthquake');
  });

  it('uses Champions 3v3 as the default pick 3 level 100 mode', () => {
    render(<App />);

    expect(screen.getAllByText(/sélection de match : 3 pokémon/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sélection incomplète : choisis 3 pokémon/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Great Tusk: 300 exact/i).length).toBeGreaterThan(0);
  });

  it('adapts match selection to Champions BSS pick 3', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/format champions/i), 'champions-bss');

    expect(screen.getAllByText(/sélection de match : 3 pokémon/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sélection incomplète : choisis 3 pokémon/i)).toBeInTheDocument();
  });

  it('parses a pasted team and displays threats', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText(/équipe showdown/i));
    await user.type(
      screen.getByLabelText(/équipe showdown/i),
      `Garchomp @ Rocky Helmet{enter}Ability: Rough Skin{enter}- Earthquake{enter}- Stealth Rock`,
    );

    expect((await screen.findAllByText('Garchomp')).length).toBeGreaterThan(0);
    expect(screen.getByText(/joués : garchomp/i)).toBeInTheDocument();
    const threatPanel = screen.getByRole('heading', { name: /menaces méta/i }).closest('section');
    expect(threatPanel).not.toBeNull();
    expect(within(threatPanel as HTMLElement).getByText(/Great Tusk|Kingambit|Corviknight/)).toBeInTheDocument();
  });

  it('shows member parse warnings from pasted teams', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText(/équipe showdown/i));
    await user.type(
      screen.getByLabelText(/équipe showdown/i),
      `Garchomp @ Rocky Helmet{enter}Ability: Rough Skin{enter}Level: banana{enter}- Earthquake`,
    );

    expect(await screen.findByText('Niveau invalide dans la ligne : Level: banana')).toBeInTheDocument();
  });
});
