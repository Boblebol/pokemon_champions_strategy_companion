import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

async function renderAppRoute(path = '/app') {
  window.history.pushState({}, '', path);
  const result = render(<App />);
  await screen.findByLabelText(/application mobile champions/i, undefined, { timeout: 5000 });
  return result;
}

async function renderLandingRoute(path = '/') {
  window.history.pushState({}, '', path);
  const result = render(<App />);
  await screen.findByLabelText(/présentation pwa champions/i, undefined, { timeout: 5000 });
  return result;
}

async function openBuildTab(user: ReturnType<typeof userEvent.setup>) {
  const nav = screen.getByRole('navigation', { name: /navigation mobile tactile/i });
  await user.click(within(nav).getByRole('button', { name: /^build$/i }));
  expect(await screen.findByText(/roster showdown champions/i, undefined, { timeout: 5000 })).toBeInTheDocument();
}

async function openMatchTab(user: ReturnType<typeof userEvent.setup>) {
  const nav = screen.getByRole('navigation', { name: /navigation mobile tactile/i });
  await user.click(within(nav).getByRole('button', { name: /^match$/i }));
  expect(await screen.findByRole('heading', { name: /match rapide/i }, { timeout: 5000 })).toBeInTheDocument();
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

describe('App', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('opens the touch-first app on the app route', async () => {
    const { container } = await renderAppRoute('/app');

    expect(screen.getByLabelText(/application mobile champions/i)).toBeInTheDocument();
    expect(container.querySelector('.mockup-mobile-shell')).toHaveAttribute('data-design-source', 'maquette_v1');
    expect(screen.getByRole('heading', { name: /^team$/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /champions mobile/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/cockpit d'analyse/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /desktop/i })).not.toBeInTheDocument();
  });

  it('keeps the mobile route as a compatibility alias', async () => {
    await renderAppRoute('/mobile');

    expect(screen.getByLabelText(/application mobile champions/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^team$/i })).toBeInTheDocument();
  });

  it('renders the GitHub Pages root as a PWA landing page with a direct app link', async () => {
    await renderLandingRoute('/');

    expect(screen.getByRole('heading', { name: /champions companion/i })).toBeInTheDocument();
    expect(screen.getByText(/pwa installable/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /ouvrir l'app/i }).map((link) => link.getAttribute('href'))).toContain(
      '/app',
    );
    expect(screen.getByRole('heading', { name: /installer sur iphone/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /installer sur android/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/application mobile champions/i)).not.toBeInTheDocument();
  });

  it('routes landing and docs aliases to the PWA install landing', async () => {
    const landing = await renderLandingRoute('/landing');

    expect(screen.getByLabelText(/présentation pwa champions/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /ouvrir l'app/i }).map((link) => link.getAttribute('href'))).toContain(
      '/app',
    );
    landing.unmount();

    const docs = await renderLandingRoute('/docs');
    expect(screen.getByLabelText(/présentation pwa champions/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /comment l'installer/i })).toBeInTheDocument();
    docs.unmount();
  });

  it('keeps the active app free of non-mockup project chrome', async () => {
    await renderAppRoute();

    expect(screen.queryByLabelText(/infos projet et créateur/i)).not.toBeInTheDocument();
    expect(screen.getByText(/disponible hors ligne/i)).toBeInTheDocument();
  });

  it('starts as a four-step assistant with an empty team ready to build', async () => {
    await renderAppRoute();

    const nav = screen.getByRole('navigation', { name: /navigation mobile tactile/i });
    expect(within(nav).getByRole('button', { name: /^team$/i })).toHaveAttribute('aria-pressed', 'true');
    expect(within(nav).getByRole('button', { name: /^build$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /^actifs$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /^match$/i })).toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /données/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /^combat$/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /analyse/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^fr$/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^en$/i })).toHaveAttribute('aria-pressed', 'false');

    expect(screen.getByText(/mon équipe/i)).toBeInTheDocument();
    expect(screen.getByText(/^team vide$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sauvegardes locales/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer une team vide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sauvegarder$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /exporter l'équipe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1v1 actif/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /2v2 actif/i })).toBeInTheDocument();
    expect(screen.getAllByText(/0\/3 actifs prêts/i).length).toBeGreaterThan(0);
  });

  it('auto-fills active picks while building and opens match without requiring six filled slots', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await selectPickerOption(user, /slot 2 pokémon/i, 'Carchacrok', /Carchacrok/i);
    await user.click(screen.getByRole('button', { name: /modifier slot 3/i }));
    await selectPickerOption(user, /slot 3 pokémon/i, 'Kangourex', /Kangourex/i);

    await user.click(screen.getByRole('button', { name: /^actifs$/i }));

    expect(screen.getByText(/3\/3 actifs prêts/i)).toBeInTheDocument();
    expect(screen.getByText(/dracolosse, carchacrok, kangourex/i)).toBeInTheDocument();

    await openMatchTab(user);

    expect(await screen.findByRole('heading', { name: /^combat$/i }, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /couverture offensive/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /couverture défensive/i })).toBeInTheDocument();
    expect(screen.getAllByText(/joués : dracolosse, carchacrok, kangourex/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /adversaires fréquents dangereux/i })).toBeInTheDocument();
  }, 15000);

  it('fills picker inputs with the selected value like the standalone mockup', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);

    expect(screen.getByLabelText(/slot 1 pokémon/i)).toHaveValue('Dracolosse');

    await selectPickerOption(user, /slot 1 objet/i, 'Grosses', /Grosses Bottes/i);

    expect(screen.getByLabelText(/slot 1 objet/i)).toHaveValue('Grosses Bottes');

    await user.click(screen.getByRole('button', { name: /^actifs$/i }));

    expect(screen.getByLabelText(/actif 1/i)).toHaveValue('Dracolosse');
  }, 10000);

  it('uses the standalone-like Team action and saves layout', async () => {
    const user = userEvent.setup();
    await renderAppRoute();

    expect(screen.getByRole('button', { name: /créer une team vide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sauvegarder$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /exporter l'équipe/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/rechercher une sauvegarde/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^sauvegarder$/i }));

    expect(screen.getByLabelText(/nom de sauvegarde/i)).toHaveFocus();
  });

  it('fills selected mobile slots with visible Pokemon media', async () => {
    const user = userEvent.setup();
    const { container } = await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);

    expect(container.querySelector('.searchable-picker[data-has-value="true"] .picker-current .pokemon-avatar')).not.toBeNull();
    expect(container.querySelector('.roster-summary-card[data-filled="true"] .roster-summary-name')).not.toBeNull();
    expect(container.querySelector('.roster-summary-card[data-filled="true"] .type-chip')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /^team$/i }));

    expect(container.querySelector('.mobile-team-slot[data-filled="true"] .pokemon-avatar')).not.toBeNull();
  }, 10000);

  it('switches between mobile screens with the tabbar', async () => {
    const user = userEvent.setup();
    await renderAppRoute();

    const nav = screen.getByRole('navigation', { name: /navigation mobile tactile/i });
    expect(within(nav).getByRole('button', { name: /^team$/i })).toHaveAttribute('aria-pressed', 'true');

    await user.click(within(nav).getByRole('button', { name: /^build$/i }));
    expect(await screen.findByRole('heading', { name: /build rapide/i })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: /^actifs$/i }));
    expect(within(await screen.findByLabelText(/actifs mobile/i)).getByRole('heading', { name: /^actifs$/i })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: /^match$/i }));
    expect(await screen.findByRole('heading', { name: /match rapide/i })).toBeInTheDocument();
  });

  it('switches picker display and search between French and English without mixed labels', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Kangaskhan', /Kangourex/i);
    expect(screen.getByLabelText(/slot 1 pokémon/i)).toHaveValue('Kangourex');
    expect(screen.queryByText(/Kangourex \(Kangaskhan\)/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^EN$/i }));
    expect(screen.getByLabelText(/slot 1 pokémon/i)).toHaveValue('Kangaskhan');
    expect(screen.getByRole('button', { name: /^Active$/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^FR$/i }));
    expect(screen.getByLabelText(/slot 1 pokémon/i)).toHaveValue('Kangourex');
    expect(screen.getByRole('button', { name: /^Actifs$/i })).toBeInTheDocument();
  }, 10000);

  it('searches moves from the selected Pokemon and shows battle metadata', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await selectPickerOption(user, /slot 2 pokémon/i, 'Carchacrok', /Carchacrok/i);

    const moveInput = screen.getByLabelText(/slot 2 attaque 1/i);
    await user.clear(moveInput);
    await user.type(moveInput, 'Séisme');

    const earthquake = await screen.findByRole('option', { name: /séisme/i });
    expect(within(earthquake).getByText(/^Sol$/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/^Physique$/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/^STAB$/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/puissance\s+100/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/précision\s+100/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/pp\s+10/i)).toBeInTheDocument();

    await user.click(earthquake);

    await user.click(screen.getByRole('button', { name: /^team$/i }));
    const exportLink = screen.getByRole('link', { name: /exporter l'équipe/i });
    expect(decodeURIComponent(exportLink.getAttribute('href') ?? '')).toContain('- Earthquake');
  }, 10000);

  it('keeps advanced build fields folded behind details by default', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    expect(screen.queryByLabelText(/slot 1 ev hp/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /détails avancés slot 1/i }));

    expect(screen.getByLabelText(/slot 1 ev hp/i)).toBeInTheDocument();
  });

  it('adapts the mockup build controls to real ability, manual nature and EV data', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);

    const abilityGroup = screen.getByRole('group', { name: /talents slot 1/i });
    expect(within(abilityGroup).getByRole('button', { name: /multiécaille/i })).toBeInTheDocument();
    expect(within(abilityGroup).getByText(/réduit/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /détails avancés slot 1/i }));

    expect(screen.getByLabelText(/slot 1 nature/i)).toHaveValue('');
    await selectPickerOption(user, /slot 1 nature/i, 'Jovial', /Jovial/i);
    expect(screen.getAllByText(/\+vitesse \/ -attaque spéciale/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /attaquant physique rapide/i }));
    expect(screen.getAllByText(/510\/510 EV/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nature : jovial/i).length).toBeGreaterThan(0);
  }, 10000);

  it('uses a searchable nature picker that previews the bonus and malus before selection', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /détails avancés slot 1/i }));

    const natureInput = screen.getByLabelText(/slot 1 nature/i);
    expect(natureInput.tagName).toBe('INPUT');

    await user.clear(natureInput);
    await user.type(natureInput, 'Jovial');

    const jollyOption = await screen.findByRole('option', { name: /jovial/i });
    expect(within(jollyOption).getAllByText(/\+vitesse \/ -attaque spéciale/i).length).toBeGreaterThan(0);

    await user.click(jollyOption);

    expect(natureInput).toHaveValue('Jovial');
  }, 10000);

  it('keeps move choices unique while searching the selected Pokemon movepool', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);

    await selectPickerOption(user, /slot 1 attaque 1/i, 'Vitesse', /Vitesse Extrême/i);
    await user.clear(screen.getByLabelText(/slot 1 attaque 2/i));
    await user.type(screen.getByLabelText(/slot 1 attaque 2/i), 'Vitesse');

    expect(screen.queryByRole('option', { name: /vitesse extrême/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await selectPickerOption(user, /slot 2 pokémon/i, 'Carchacrok', /Carchacrok/i);
    await user.clear(screen.getByLabelText(/slot 2 attaque 1/i));
    await user.type(screen.getByLabelText(/slot 2 attaque 1/i), 'Vitesse');

    expect(screen.queryByRole('option', { name: /vitesse extrême/i })).not.toBeInTheDocument();
  }, 10000);

  it('hydrates slot details with tera and EV defaults while keeping nature empty', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);

    expect(screen.queryByRole('group', { name: /types tera slot 1/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /détails avancés slot 1/i }));

    expect(screen.getByLabelText(/slot 1 nature/i)).toHaveValue('');
    expect(screen.queryByText(/nature : jovial/i)).not.toBeInTheDocument();
    expect(screen.getByText(/tera dragon/i)).toBeInTheDocument();

    const teraGroup = screen.getByRole('group', { name: /types tera slot 1/i });
    expect(within(teraGroup).getByRole('button', { name: /^dragon$/i })).toHaveAttribute('aria-pressed', 'true');

    expect(screen.getByRole('progressbar', { name: /progression ev slot 1/i })).toHaveAttribute(
      'aria-valuenow',
      '510',
    );
    expect(screen.getByLabelText(/slot 1 ev atk/i)).toHaveValue(252);
    expect(screen.getByLabelText(/slot 1 ev spe/i)).toHaveValue(252);
  }, 10000);

  it('hides Pokemon already selected in another team slot', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await user.clear(screen.getByLabelText(/slot 2 pokémon/i));
    await user.type(screen.getByLabelText(/slot 2 pokémon/i), 'Dracolosse');

    expect(screen.queryByRole('option', { name: /dracolosse/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /modifier slot 1/i }));
    await user.clear(screen.getByLabelText(/slot 1 pokémon/i));
    await user.type(screen.getByLabelText(/slot 1 pokémon/i), 'Dracolosse');

    expect(await screen.findByRole('option', { name: /dracolosse/i })).toBeInTheDocument();
  }, 10000);

  it('hides active Pokemon already selected in another active picker', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await selectPickerOption(user, /slot 2 pokémon/i, 'Carchacrok', /Carchacrok/i);
    await user.click(screen.getByRole('button', { name: /^actifs$/i }));

    expect(screen.getByText(/multiécaille/i)).toBeInTheDocument();
    expect(screen.queryByText(/multiscale/i)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(/actif 2/i));
    await user.type(screen.getByLabelText(/actif 2/i), 'Dracolosse');

    expect(screen.queryByRole('option', { name: /dracolosse/i })).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(/actif 1/i));
    await user.type(screen.getByLabelText(/actif 1/i), 'Dracolosse');

    expect(await screen.findByRole('option', { name: /dracolosse/i })).toBeInTheDocument();
  }, 10000);

  it('saves, loads, deletes and exports teams from local browser storage', async () => {
    const user = userEvent.setup();
    await renderAppRoute();

    await user.click(screen.getByRole('button', { name: /^build$/i }));
    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /^team$/i }));

    await user.type(screen.getByLabelText(/nom de sauvegarde/i), 'Ladder BO1');
    await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

    expect(screen.getByText(/équipe sauvegardée localement/i)).toBeInTheDocument();
    expect(within(screen.getByLabelText(/sauvegardes locales/i)).getByText(/^Ladder BO1$/i)).toBeInTheDocument();

    const teamExportLink = screen.getByRole('link', { name: /exporter l'équipe/i });
    expect(teamExportLink).toHaveAttribute('download', 'pokemon-champions-team.txt');
    expect(decodeURIComponent(teamExportLink.getAttribute('href') ?? '')).toContain('Dragonite');

    await user.click(screen.getByRole('button', { name: /charger Ladder BO1/i }));
    expect(await screen.findByRole('heading', { name: /build rapide/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^team$/i }));

    await user.click(screen.getByRole('button', { name: /supprimer Ladder BO1/i }));
    expect(screen.getByText(/aucune équipe sauvegardée/i)).toBeInTheDocument();
  });

  it('filters saved teams by search before loading', async () => {
    const user = userEvent.setup();
    await renderAppRoute();

    await user.click(screen.getByRole('button', { name: /^build$/i }));
    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /^team$/i }));
    await user.type(screen.getByLabelText(/nom de sauvegarde/i), 'Ladder BO1');
    await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

    await user.click(screen.getByRole('button', { name: /créer une team vide/i }));
    await selectPickerOption(user, /slot 1 pokémon/i, 'Kangourex', /Kangourex/i);
    await user.click(screen.getByRole('button', { name: /^team$/i }));
    await user.type(screen.getByLabelText(/nom de sauvegarde/i), 'Casual test');
    await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

    await user.type(screen.getByLabelText(/rechercher une sauvegarde/i), 'ladder');

    expect(within(screen.getByLabelText(/sauvegardes locales/i)).getByText(/^Ladder BO1$/i)).toBeInTheDocument();
    expect(within(screen.getByLabelText(/sauvegardes locales/i)).queryByText(/^Casual test$/i)).not.toBeInTheDocument();
  }, 15000);

  it('exports a markdown analysis report from the match screen', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openMatchTab(user);

    const exportLink = screen.getByRole('link', { name: /exporter l'analyse/i });
    expect(exportLink).toHaveAttribute('download', 'pokemon-champions-analyse.md');
    const decodedReport = decodeURIComponent(exportLink.getAttribute('href') ?? '');
    expect(decodedReport).toContain('# Rapport Champions Companion');
    expect(decodedReport).toContain('Dracolosse');
    expect(decodedReport).toContain('Menaces frequentes');
  });
});
