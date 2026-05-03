import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

async function waitForCompleteReference() {
  expect(await screen.findByText(/source complète/i, undefined, { timeout: 5000 })).toBeInTheDocument();
}

async function selectPickerOption(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  query: string,
  optionName: RegExp,
) {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  await user.type(input, query);
  await user.click(await screen.findByRole('option', { name: optionName }, { timeout: 5000 }));
}

async function openSetupWizard(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /afficher l'assistant/i }));
}

describe('App', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
    window.localStorage.clear();
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
    expect(within(landing).getAllByText(/adversaires rares/i).length).toBeGreaterThan(0);
    expect(within(landing).getAllByText(/équipe de 6/i).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/cockpit d'analyse/i)).not.toBeInTheDocument();
  });

  it('renders a standalone documentation page', () => {
    window.history.pushState({}, '', '/docs');
    render(<App />);

    const docs = screen.getByLabelText(/documentation/i);
    expect(within(docs).getByRole('heading', { name: /documentation champions companion/i })).toBeInTheDocument();
    expect(within(docs).getByRole('link', { name: /ouvrir l'app/i })).toHaveAttribute('href', '/app');
    expect(within(docs).getByText(/1\. démarrer avec l'assistant/i)).toBeInTheDocument();
    expect(within(docs).getByText(/importer un fichier \.txt/i)).toBeInTheDocument();
    expect(within(docs).getByText(/5\. simuler le combat/i)).toBeInTheDocument();
    expect(within(docs).getByText(/6\. lire les attaques dangereuses/i)).toBeInTheDocument();
    expect(within(docs).getByText(/le refresh smogon peut échouer/i)).toBeInTheDocument();
  });

  it('renders the app route without the landing page', () => {
    window.history.pushState({}, '', '/app');
    render(<App />);

    expect(screen.getByLabelText(/cockpit d'analyse/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ouvrir la doc/i })).toHaveAttribute('href', '/docs');
    expect(screen.queryByLabelText(/présentation marketing/i)).not.toBeInTheDocument();
  });

  it('keeps responsive layout hooks available for cockpit sections', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.top-bar')).not.toBeNull();
    expect(container.querySelector('.setup-guide')).not.toBeNull();
    expect(container.querySelector('.builder-workspace')).not.toBeNull();
    expect(container.querySelector('.combat-layout')).not.toBeNull();
    expect(container.querySelector('.dashboard')).not.toBeNull();
  });

  it('groups dashboard analysis panels for desktop scanning', () => {
    const { container } = render(<App />);

    const dashboardPrimary = container.querySelector('.dashboard-primary');
    const dashboardSecondary = container.querySelector('.dashboard-secondary');

    expect(dashboardPrimary).not.toBeNull();
    expect(dashboardSecondary).not.toBeNull();

    const primaryPanels = within(dashboardPrimary as HTMLElement);
    const secondaryPanels = within(dashboardSecondary as HTMLElement);

    expect(primaryPanels.getByRole('heading', { name: /^équipe$/i })).toBeInTheDocument();
    expect(primaryPanels.getByRole('heading', { name: /plan de match 3v3/i })).toBeInTheDocument();
    expect(secondaryPanels.getByRole('heading', { name: /audit d'équipe/i })).toBeInTheDocument();
    expect(secondaryPanels.getByRole('heading', { name: /adversaires fréquents dangereux/i })).toBeInTheDocument();
    expect(secondaryPanels.getByRole('heading', { name: /adversaires rares dangereux/i })).toBeInTheDocument();
    expect(secondaryPanels.getByRole('heading', { name: /aides rapides/i })).toBeInTheDocument();
  });

  it('renders the French graphical wizard and dashboard regions', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openSetupWizard(user);

    expect(screen.getByRole('heading', { name: /cockpit stratégique/i })).toBeInTheDocument();
    expect(screen.getByText(/1\s+format/i)).toBeInTheDocument();
    expect(screen.getByText(/2\s+équipe/i)).toBeInTheDocument();
    expect(screen.getByText(/3\s+sélection/i)).toBeInTheDocument();
    expect(screen.getByText(/4\s+combat/i)).toBeInTheDocument();
    expect(screen.getByText(/5\s+analyse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/format champions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/équipe showdown/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /audit d'équipe/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /adversaires fréquents dangereux/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /adversaires rares dangereux/i })).toBeInTheDocument();
    expect(screen.getByText(/choisis 3 pokémon pour voir les adversaires rares/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cockpit d'analyse/i)).toBeInTheDocument();
    expect(screen.getAllByText(/équipe de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /plan de match 3v3/i })).toBeInTheDocument();
    expect(screen.getAllByText(/niveau 100/i).length).toBeGreaterThan(0);
  });

  it('renders contextual help for strategy and data freshness', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /aides rapides/i })).toBeInTheDocument();
    expect(screen.getByText(/assistant de départ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/combat/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/adversaire dangereux/i)).toBeInTheDocument();
    expect(screen.getByText(/données à jour/i)).toBeInTheDocument();
  });

  it('renders the setup wizard compact by default and can expand it', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByLabelText(/équipe showdown/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/résumé assistant/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /afficher l'assistant/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /afficher l'assistant/i }));

    expect(screen.getByLabelText(/équipe showdown/i)).toBeInTheDocument();
    expect(window.localStorage.getItem('champions-companion.setup-wizard')).toBe('visible');

    await user.click(screen.getByRole('button', { name: /masquer l'assistant/i }));

    expect(screen.queryByLabelText(/équipe showdown/i)).not.toBeInTheDocument();
    expect(window.localStorage.getItem('champions-companion.setup-wizard')).toBe('hidden');
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

  it('lets users switch slots from a compact team rail', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));

    expect(screen.getByLabelText(/slot 2 pokémon/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /modifier slot 1/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /modifier slot 2/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps picker results closed until the user searches or focuses the picker', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByRole('listbox', { name: /résultats de recherche/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /carchacrok/i })).not.toBeInTheDocument();

    const pokemonInput = screen.getByLabelText(/slot 1 pokémon/i);
    expect(pokemonInput).toHaveAttribute('aria-expanded', 'false');
    await user.click(pokemonInput);

    expect(pokemonInput).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: /résultats de recherche/i })).toBeInTheDocument();

    await user.clear(pokemonInput);
    await user.type(pokemonInput, 'Carcha');

    expect(await screen.findByRole('option', { name: /carchacrok/i })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: /carchacrok/i }));

    expect(pokemonInput).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('option', { name: /dragonite/i })).not.toBeInTheDocument();
  });

  it('imports and exports a Showdown team file from the setup assistant', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openSetupWizard(user);

    const importedPaste = `Dragonite @ Heavy-Duty Boots
Ability: Multiscale
Tera Type: Normal
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Extreme Speed`;
    const file = new File([importedPaste], 'dragonite-team.txt', { type: 'text/plain' });

    await user.upload(screen.getByLabelText(/importer un fichier équipe/i), file);
    expect(await screen.findByText(/fichier importé : dragonite-team\.txt/i)).toBeInTheDocument();

    const paste = screen.getByLabelText(/équipe showdown/i) as HTMLTextAreaElement;
    expect(paste.value).toContain('Dragonite @ Heavy-Duty Boots');
    expect(await screen.findAllByText(/Dragonite/i)).not.toHaveLength(0);

    const exportLink = screen.getByRole('link', { name: /exporter l'équipe/i });
    expect(exportLink).toHaveAttribute('download', 'pokemon-champions-team.txt');
    expect(decodeURIComponent(exportLink.getAttribute('href') ?? '')).toContain('Dragonite @ Heavy-Duty Boots');
  });

  it('helps users fill a standard 252 / 252 / 6 EV spread', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openSetupWizard(user);

    await user.click(screen.getByRole('button', { name: /attaquant physique rapide/i }));

    expect(screen.getByLabelText(/slot 1 ev hp/i)).toHaveValue(6);
    expect(screen.getByLabelText(/slot 1 ev atk/i)).toHaveValue(252);
    expect(screen.getByLabelText(/slot 1 ev def/i)).toHaveValue(null);
    expect(screen.getByLabelText(/slot 1 ev spa/i)).toHaveValue(null);
    expect(screen.getByLabelText(/slot 1 ev spd/i)).toHaveValue(null);
    expect(screen.getByLabelText(/slot 1 ev spe/i)).toHaveValue(252);
    expect(screen.getByText(/ev utilisés : 510\/510/i)).toBeInTheDocument();

    const paste = screen.getByLabelText(/équipe showdown/i) as HTMLTextAreaElement;
    expect(paste.value).toContain('EVs: 6 HP / 252 Atk / 252 Spe');
  });

  it('explains selected abilities and natures in simple French', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/active paléosynthèse avec le soleil/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/slot 1 nature/i), 'Jolly');

    expect(screen.getByText(/augmente la vitesse/i)).toBeInTheDocument();
    expect(screen.getByText(/baisse l'attaque spéciale/i)).toBeInTheDocument();
  });

  it('shows a combat calculator after the team tools', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { level: 2, name: /^combat$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/rechercher adversaire 1/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dégâts que tu fais/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/dégâts que tu reçois/i).length).toBeGreaterThan(0);
  });

  it('hides advanced combat controls behind a disclosure', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: /^combat$/i })).toBeInTheDocument();
    const advancedToggle = screen.getByRole('button', { name: /options combat avancées/i });
    const controlledRegionIds = advancedToggle.getAttribute('aria-controls')?.split(/\s+/) ?? [];

    expect(advancedToggle).toHaveAttribute('aria-expanded', 'false');
    expect(controlledRegionIds).toContain('combat-advanced-controls');
    expect(controlledRegionIds.some((id) => id.startsWith('combat-opponent-advanced-controls-'))).toBe(true);
    expect(document.getElementById('combat-advanced-controls')).toBeInTheDocument();
    expect(
      controlledRegionIds.some((id) => id.startsWith('combat-opponent-advanced-controls-') && document.getElementById(id)),
    ).toBe(true);
    expect(screen.getByLabelText(/rechercher adversaire 1/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /météo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /terrain/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /protections alliées/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /modifs allié/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /modifs adversaire/i })).not.toBeInTheDocument();

    await user.click(advancedToggle);

    expect(advancedToggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('combat-advanced-controls')).toBeInTheDocument();
    expect(controlledRegionIds.some((id) => document.getElementById(id)?.textContent?.match(/modifs adversaire/i))).toBe(
      true,
    );
    expect(screen.getByRole('combobox', { name: /météo/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /terrain/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /protections alliées/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /modifs allié/i })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /modifs adversaire/i }).length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByRole('combobox', { name: /météo/i }), 'Sun');
    await user.click(advancedToggle);

    expect(advancedToggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('combobox', { name: /météo/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /options combat avancées · 1 active/i })).toBeInTheDocument();
  });

  it('loads the complete Showdown reference in the builder with French searchable media', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await waitForCompleteReference();
    await selectPickerOption(user, /slot 1 pokémon/i, 'Kangourex', /Kangourex \(Kangaskhan\)/i);
    expect(container.querySelector('.picker-current img[src*="/pokemon/115.png"]')).not.toBeNull();

    await selectPickerOption(user, /slot 1 objet/i, 'Heavy Duty Boots', /Grosses Bottes \(Heavy-Duty Boots\)/i);
    expect(screen.getByText(/pièges posés de son côté/i)).toBeInTheDocument();
    expect(container.querySelector('.picker-current img[src*="/items/gen8/heavy-duty-boots.png"]')).not.toBeNull();
  }, 10000);

  it('updates the roster from builder controls and exports the generated paste', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openSetupWizard(user);

    await waitForCompleteReference();
    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await selectPickerOption(user, /slot 2 pokémon/i, 'Dracolosse', /Dracolosse \(Dragonite\)/i);
    await selectPickerOption(user, /slot 2 objet/i, 'Grosses Bottes', /Grosses Bottes \(Heavy-Duty Boots\)/i);
    await user.selectOptions(screen.getByLabelText(/slot 2 attaque 1/i), 'Extreme Speed');
    await user.clear(screen.getByLabelText(/slot 2 ev atk/i));
    await user.type(screen.getByLabelText(/slot 2 ev atk/i), '252');
    await user.type(screen.getByLabelText(/commentaire slot 2/i), 'Win condition prioritaire.');

    const paste = screen.getByLabelText(/équipe showdown/i) as HTMLTextAreaElement;
    expect(paste.value).toContain('Dragonite @ Heavy-Duty Boots');
    expect(paste.value).toContain('EVs: 252 Atk');
    expect(paste.value).not.toContain('Win condition');
    expect(await screen.findAllByText(/Dracolosse \(Dragonite\)/i)).not.toHaveLength(0);
  });

  it('filters set dropdowns from the selected Pokémon reference', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openSetupWizard(user);

    await waitForCompleteReference();
    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await selectPickerOption(user, /slot 2 pokémon/i, 'Carchacrok', /Carchacrok \(Garchomp\)/i);

    const abilitySelect = screen.getByLabelText(/slot 2 talent/i);
    expect(within(abilitySelect).getByRole('option', { name: /Peau Dure \(Rough Skin\)/i })).toBeInTheDocument();
    expect(within(abilitySelect).queryByRole('option', { name: /Multiscale/i })).not.toBeInTheDocument();
    await user.selectOptions(abilitySelect, 'Rough Skin');

    const firstMoveSelect = screen.getByLabelText(/slot 2 attaque 1/i);
    expect(within(firstMoveSelect).getByRole('option', { name: /Séisme \(Earthquake\)/i })).toBeInTheDocument();
    expect(within(firstMoveSelect).queryByRole('option', { name: /Moonblast/i })).not.toBeInTheDocument();
    await user.selectOptions(firstMoveSelect, 'Earthquake');
    await selectPickerOption(user, /slot 2 objet/i, 'Casque Brut', /Casque Brut \(Rocky Helmet\)/i);
    await user.selectOptions(screen.getByLabelText(/slot 2 .*type tera/i), 'Ground');
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

    expect(screen.getAllByText(/sélection de match : choisis 3 pokémon/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sélection incomplète : choisis 3 pokémon/i)).toBeInTheDocument();
    expect(screen.getAllByText(/(Fort-Ivoire \(Great Tusk\)|Great Tusk): 300 exact/i).length).toBeGreaterThan(0);
  });

  it('adapts match selection to Champions BSS pick 3', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openSetupWizard(user);

    await user.selectOptions(screen.getByLabelText(/format champions/i), 'champions-bss');

    expect(screen.getAllByText(/sélection de match : choisis 3 pokémon/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sélection incomplète : choisis 3 pokémon/i)).toBeInTheDocument();
  });

  it('parses a pasted team and displays threats', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openSetupWizard(user);

    await user.clear(screen.getByLabelText(/équipe showdown/i));
    await user.type(
      screen.getByLabelText(/équipe showdown/i),
      `Garchomp @ Rocky Helmet{enter}Ability: Rough Skin{enter}- Earthquake{enter}- Stealth Rock`,
    );

    expect((await screen.findAllByText(/Carchacrok \(Garchomp\)/i)).length).toBeGreaterThan(0);
    expect(screen.getByText(/joués : carchacrok \(garchomp\)/i)).toBeInTheDocument();
    const threatPanel = screen.getByRole('heading', { name: /adversaires fréquents dangereux/i }).closest('section');
    expect(threatPanel).not.toBeNull();
    expect(
      within(threatPanel as HTMLElement).getByText(/Fort-Ivoire|Scalpereur|Corvaillus|Great Tusk|Kingambit|Corviknight/i),
    ).toBeInTheDocument();
  });

  it('shows member parse warnings from pasted teams', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openSetupWizard(user);

    await user.clear(screen.getByLabelText(/équipe showdown/i));
    await user.type(
      screen.getByLabelText(/équipe showdown/i),
      `Garchomp @ Rocky Helmet{enter}Ability: Rough Skin{enter}Level: banana{enter}- Earthquake`,
    );

    expect(await screen.findByText('Niveau invalide dans la ligne : Level: banana')).toBeInTheDocument();
  });
});
